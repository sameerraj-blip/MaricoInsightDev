import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { DataSummary } from '../../shared/schema.js';

export async function parseFile(buffer: Buffer, filename: string): Promise<Record<string, any>[]> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return parseCsv(buffer);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseExcel(buffer);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel files.');
  }
}

function parseCsv(buffer: Buffer): Record<string, any>[] {
  const content = buffer.toString('utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
    cast_date: true,
  });
  
  // Normalize column names: trim whitespace from all column names
  return normalizeColumnNames(records as Record<string, any>[]);
}

function parseExcel(buffer: Buffer): Record<string, any>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });
  
  // Normalize column names: trim whitespace from all column names
  return normalizeColumnNames(data as Record<string, any>[]);
}

/**
 * Normalizes column names by trimming whitespace from all keys
 * This ensures consistent column name handling throughout the application
 */
function normalizeColumnNames(data: Record<string, any>[]): Record<string, any>[] {
  if (!data || data.length === 0) {
    return data;
  }
  
  // Create a mapping of old column names to normalized (trimmed) names
  const firstRow = data[0];
  const columnMapping: Record<string, string> = {};
  
  for (const oldKey of Object.keys(firstRow)) {
    const normalizedKey = oldKey.trim();
    if (oldKey !== normalizedKey) {
      columnMapping[oldKey] = normalizedKey;
    }
  }
  
  // If no normalization needed, return as-is
  if (Object.keys(columnMapping).length === 0) {
    return data;
  }
  
  // Remap all rows to use normalized column names
  return data.map(row => {
    const normalizedRow: Record<string, any> = {};
    for (const [oldKey, value] of Object.entries(row)) {
      const newKey = columnMapping[oldKey] || oldKey.trim();
      normalizedRow[newKey] = value;
    }
    return normalizedRow;
  });
}

export function createDataSummary(data: Record<string, any>[]): DataSummary {
  if (data.length === 0) {
    throw new Error('No data found in file');
  }

  const columns = Object.keys(data[0]);
  const numericColumns: string[] = [];
  const dateColumns: string[] = [];

  const columnInfo = columns.map((col) => {
    const values = data.slice(0, 100).map((row) => row[col]);
    const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== '');

    // Determine column type
    let type = 'string';
    
    // Check if numeric (handle percentages by stripping % symbol)
    const isNumeric = nonNullValues.every((v) => {
      if (v === '') return false;
      // Strip % symbol and commas for numeric check
      const cleaned = String(v).replace(/[%,]/g, '').trim();
      return !isNaN(Number(cleaned)) && cleaned !== '';
    });
    
    const isDate = nonNullValues.some((v) => {
      const date = new Date(v);
      return !isNaN(date.getTime()) && typeof v === 'string' && v.match(/\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}/);
    });

    if (isNumeric) {
      type = 'number';
      numericColumns.push(col);
    } else if (isDate) {
      type = 'date';
      dateColumns.push(col);
    }

    // Serialize sample values to primitives (convert Date objects to strings)
    const sampleValues = values.slice(0, 3).map((v) => {
      if (v instanceof Date) {
        return v.toISOString();
      }
      return v;
    });

    return {
      name: col,
      type,
      sampleValues,
    };
  });

  return {
    rowCount: data.length,
    columnCount: columns.length,
    columns: columnInfo,
    numericColumns,
    dateColumns,
  };
}
