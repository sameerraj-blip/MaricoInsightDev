## Dashboard Data Contracts

### Overview
The revamped dashboard breaks content into sections, tiles, and contextual metadata. The backend must return normalized payloads that the frontend can cache and render without additional shape transformations.

### Core Types (shared)
```ts
type DashboardSection = {
  id: string;
  title: string;
  description?: string;
  layout: {
    order: number;
    span?: 1 | 2;
  };
  tiles: DashboardTile[];
};

type DashboardTile =
  | ChartTile
  | InsightTile
  | ActionTile
  | TrendListTile;

type ChartTile = {
  kind: "chart";
  chart: ChartSpec;
  primaryMetric?: MetricSummary;
  supportingMetrics?: MetricSummary[];
  insightId?: string;
  exportReadyImageUrl?: string;
  lastRefreshedAt: string;
};

type InsightTile = {
  kind: "insight";
  id: string;
  title: string;
  narrative: string;
  tags: string[];
  confidence: "low" | "medium" | "high";
  relatedChartId?: string;
  relatedSessionId?: string;
};

type ActionTile = {
  kind: "action";
  id: string;
  title: string;
  recommendation: string;
  estimatedImpact?: ImpactEstimate;
  suggestedOwners?: string[];
  cta?: { label: string; action: "acknowledge" | "share" | "open_url"; payload?: string };
};

type TrendListTile = {
  kind: "trend-list";
  id: string;
  items: Array<{
    label: string;
    delta: string;
    direction: "up" | "down" | "flat";
    context?: string;
  }>;
};

type MetricSummary = {
  label: string;
  value: number;
  formattedValue: string;
  change?: {
    value: number;
    formattedValue: string;
    period: "wow" | "mom" | "yoy";
  };
};

type ImpactEstimate = {
  value: number;
  formattedValue: string;
  unit: "currency" | "percentage" | "index";
  timeframe?: string;
};
```

### API Endpoints
1. `GET /api/dashboards/:dashboardId`
   - Returns `DashboardDetail` containing sections, tiles, filter metadata, export stats.
2. `POST /api/dashboards/:dashboardId/refresh`
   - Triggers recomputation of insights with current filter set; responds with job id for polling.
3. `POST /api/dashboards/:dashboardId/layout`
   - Persists layout overrides (tile order, spans).
4. `GET /api/dashboards/:dashboardId/export-status`
   - Optionally stream export job progress.

### DashboardDetail Shape
```ts
type DashboardDetail = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  latestDataAt?: string;
  filters: DashboardFilterState;
  sections: DashboardSection[];
};

type DashboardFilterState = {
  available: Array<{
    id: string;
    label: string;
    type: "single-select" | "multi-select" | "date-range";
    options: Array<{ id: string; label: string; description?: string }>;
    defaultOptionIds?: string[];
  }>;
  applied: Record<string, string[]>;
};
```

### Backend Responsibilities
- Normalize chart data and narratives during insight generation (see `server/lib/insightGenerator.ts`).
- Store computed tiles inside Cosmos dashboard document to reduce load times; include `dataVersion` to detect staleness.
- Provide lightweight `HEAD /api/dashboards/:id/summary` for list view (id, name, tile counts, freshest timestamp).
- Emit SSE or websocket updates for long-running refresh jobs to keep UI responsive.

### Frontend Considerations
- Use stable `tile.id` to manage optimistic updates and drag/drop reordering.
- Cache `DashboardDetail` responses per filter combination using React Query with SWR (stale-while-revalidate).
- Prefetch sections lazily when they enter viewport using IntersectionObserver hints.


