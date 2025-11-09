import { openai, MODEL } from './openai.js';
import { ParsedQuery, TimeFilter, ValueFilter, ExclusionFilter, AggregationRequest, SortRequest, TopBottomRequest } from '../../shared/queryTypes.js';
import { DataSummary, Message } from '../../shared/schema.js';

interface QueryParserResult extends ParsedQuery {
  confidence: number;
}

type Nullable<T> = { [K in keyof T]?: T[K] | null };

const MONTH_ALIASES: Record<string, string> = {
  jan: 'January',
  january: 'January',
  feb: 'February',
  february: 'February',
  mar: 'March',
  march: 'March',
  apr: 'April',
  april: 'April',
  may: 'May',
  jun: 'June',
  june: 'June',
  jul: 'July',
  july: 'July',
  aug: 'August',
  august: 'August',
  sep: 'September',
  sept: 'September',
  september: 'September',
  oct: 'October',
  october: 'October',
  nov: 'November',
  november: 'November',
  dec: 'December',
  december: 'December',
};

function normaliseMonthName(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return MONTH_ALIASES[key] || undefined;
}

function sanitiseTimeFilters(filters?: Nullable<TimeFilter>[]): TimeFilter[] | undefined {
  if (!filters) return undefined;
  const cleaned: TimeFilter[] = [];
  for (const filter of filters) {
    if (!filter || !filter.type) continue;
    const entry: TimeFilter = { type: filter.type } as TimeFilter;
    if (filter.column) entry.column = filter.column;
    if (filter.years) entry.years = filter.years.filter((y): y is number => typeof y === 'number' && !isNaN(y));
    if (filter.months) {
      const months = filter.months
        .map((m) => (typeof m === 'string' ? normaliseMonthName(m) : undefined))
        .filter((m): m is string => Boolean(m));
      if (months.length) entry.months = months;
    }
    if (filter.quarters) {
      const quarters = filter.quarters.filter((q): q is 1 | 2 | 3 | 4 => [1, 2, 3, 4].includes(q as number));
      if (quarters.length) entry.quarters = quarters;
    }
    if (filter.startDate) entry.startDate = filter.startDate;
    if (filter.endDate) entry.endDate = filter.endDate;
    if (filter.relative && filter.relative.amount && filter.relative.unit && filter.relative.direction) {
      entry.relative = {
        unit: filter.relative.unit,
        direction: filter.relative.direction,
        amount: filter.relative.amount,
      };
    }
    cleaned.push(entry);
  }
  return cleaned.length ? cleaned : undefined;
}

function sanitiseValueFilters(filters?: Nullable<ValueFilter>[]): ValueFilter[] | undefined {
  if (!filters) return undefined;
  const cleaned: ValueFilter[] = [];
  for (const filter of filters) {
    if (!filter || !filter.column || !filter.operator) continue;
    const entry: ValueFilter = {
      column: filter.column,
      operator: filter.operator,
    };
    if (typeof filter.value === 'number' && !isNaN(filter.value)) {
      entry.value = filter.value;
    }
    if (typeof filter.value2 === 'number' && !isNaN(filter.value2)) {
      entry.value2 = filter.value2;
    }
    if (filter.reference) entry.reference = filter.reference;
    cleaned.push(entry);
  }
  return cleaned.length ? cleaned : undefined;
}

function sanitiseExclusionFilters(filters?: Nullable<ExclusionFilter>[]): ExclusionFilter[] | undefined {
  if (!filters) return undefined;
  const cleaned: ExclusionFilter[] = [];
  for (const filter of filters) {
    if (!filter || !filter.column || !Array.isArray(filter.values)) continue;
    const values = filter.values.filter((v) => v !== null && v !== undefined);
    if (!values.length) continue;
    cleaned.push({ column: filter.column, values });
  }
  return cleaned.length ? cleaned : undefined;
}

function sanitiseAggregations(aggs?: Nullable<AggregationRequest>[]): AggregationRequest[] | undefined {
  if (!aggs) return undefined;
  const cleaned: AggregationRequest[] = [];
  for (const agg of aggs) {
    if (!agg || !agg.column || !agg.operation) continue;
    cleaned.push({
      column: agg.column,
      operation: agg.operation,
      alias: agg.alias || undefined,
    });
  }
  return cleaned.length ? cleaned : undefined;
}

function sanitiseSort(sort?: Nullable<SortRequest>[]): SortRequest[] | undefined {
  if (!sort) return undefined;
  const cleaned: SortRequest[] = [];
  for (const item of sort) {
    if (!item || !item.column || !item.direction) continue;
    const direction = item.direction === 'asc' ? 'asc' : item.direction === 'desc' ? 'desc' : undefined;
    if (!direction) continue;
    cleaned.push({ column: item.column, direction });
  }
  return cleaned.length ? cleaned : undefined;
}

function sanitiseTopBottom(request?: Nullable<TopBottomRequest>): TopBottomRequest | undefined {
  if (!request || !request.type || !request.column || !request.count) return undefined;
  return {
    type: request.type === 'bottom' ? 'bottom' : 'top',
    column: request.column,
    count: Math.max(1, Math.round(request.count)),
  };
}

function sanitiseParsedQuery(raw: Nullable<QueryParserResult>): QueryParserResult {
  const parsed: QueryParserResult = {
    rawQuestion: raw?.rawQuestion || '',
    confidence: raw?.confidence ?? 0,
  };
  if (raw?.chartTypeHint) parsed.chartTypeHint = raw.chartTypeHint;
  if (raw?.variables) parsed.variables = raw.variables.filter(Boolean) as string[];
  if (raw?.secondaryVariables) parsed.secondaryVariables = raw.secondaryVariables.filter(Boolean) as string[];
  if (raw?.groupBy) parsed.groupBy = raw.groupBy.filter(Boolean) as string[];
  parsed.timeFilters = sanitiseTimeFilters(raw?.timeFilters as Nullable<TimeFilter>[]);
  parsed.valueFilters = sanitiseValueFilters(raw?.valueFilters as Nullable<ValueFilter>[]);
  parsed.exclusionFilters = sanitiseExclusionFilters(raw?.exclusionFilters as Nullable<ExclusionFilter>[]);
  parsed.logicalOperator = raw?.logicalOperator === 'OR' ? 'OR' : 'AND';
  parsed.aggregations = sanitiseAggregations(raw?.aggregations as Nullable<AggregationRequest>[]);
  parsed.sort = sanitiseSort(raw?.sort as Nullable<SortRequest>[]);
  parsed.topBottom = sanitiseTopBottom(raw?.topBottom as Nullable<TopBottomRequest>);
  if (typeof raw?.limit === 'number') parsed.limit = Math.max(1, Math.round(raw.limit));
  if (raw?.notes) parsed.notes = raw.notes.filter(Boolean) as string[];
  return parsed;
}

export async function parseUserQuery(
  question: string,
  summary: DataSummary,
  chatHistory: Message[] = []
): Promise<QueryParserResult> {
  const recentHistory = chatHistory
    .slice(-6)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a data analysis query parser. Interpret the user's question and extract structured filters.

USER QUESTION:
"""
${question}
"""

CONTEXT (recent conversation):
${recentHistory || 'N/A'}

AVAILABLE COLUMNS:
${summary.columns.map((c) => `${c.name} [${c.type}]`).join(', ')}

NUMERIC COLUMNS: ${summary.numericColumns.join(', ') || 'None'}
DATE COLUMNS: ${summary.dateColumns.join(', ') || 'None'}

YOUR TASK:
- Extract the user's intent into structured filters.
- Use ONLY the columns provided.
- If the user references time (years, months, quarters, ranges), capture it in timeFilters.
- If the user specifies numeric conditions (>, <, between, etc.), capture in valueFilters.
- If the user wants to exclude categories, use exclusionFilters.
- If the user asks for top/bottom N, populate topBottom.
- Capture requested aggregations (sum, mean, count, etc.) and groupings.
- Identify chart type hints (line, bar, scatter, pie, area) if strongly implied.
- List key variables mentioned.
- Provide a confidence score between 0 and 1.

Output valid JSON with the following structure:
{
  "rawQuestion": string,
  "confidence": number between 0 and 1,
  "chartTypeHint": "line" | "bar" | "scatter" | "pie" | "area" | null,
  "variables": string[] | null,
  "secondaryVariables": string[] | null,
  "groupBy": string[] | null,
  "timeFilters": [
    {
      "type": "year" | "month" | "quarter" | "dateRange" | "relative",
      "column": string | null,
      "years": number[] | null,
      "months": string[] | null,
      "quarters": [1,2,3,4] | null,
      "startDate": string | null,
      "endDate": string | null,
      "relative": { "unit": "month"|"quarter"|"year"|"week", "direction": "past"|"future", "amount": number } | null
    }
  ] | null,
  "valueFilters": [
    { "column": string, "operator": ">"|">="|"<"|"<="|"="|"between"|"!=", "value": number | null, "value2": number | null, "reference": "mean"|"median"|"p75"|"p25"|"max"|"min"|null }
  ] | null,
  "exclusionFilters": [ { "column": string, "values": (string|number)[] } ] | null,
  "logicalOperator": "AND" | "OR" | null,
  "aggregations": [ { "column": string, "operation": "sum"|"mean"|"avg"|"count"|"min"|"max"|"median", "alias": string | null } ] | null,
  "sort": [ { "column": string, "direction": "asc"|"desc" } ] | null,
  "topBottom": { "type": "top"|"bottom", "column": string, "count": number } | null,
  "limit": number | null,
  "notes": string[] | null
}
Ensure the JSON is strict and contains no comments.`;

  const response = await openai.chat.completions.create({
    model: MODEL as string,
    messages: [
      { role: 'system', content: 'You convert natural language questions into structured filter objects for data analysis.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
    max_tokens: 700,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      rawQuestion: question,
      confidence: 0,
    };
  }

  try {
    const parsed = JSON.parse(content) as Nullable<QueryParserResult>;
    return sanitiseParsedQuery(parsed);
  } catch (error) {
    console.error('❌ Failed to parse query parser response:', error, content);
    return {
      rawQuestion: question,
      confidence: 0,
    };
  }
}
