## Dashboard UX Blueprint

### Experience Pillars
- Immediate comprehension: highlight dashboard title, freshness timestamp, and primary KPIs without scrolling.
- Guided exploration: each section packages charts with narrative context and next-best actions.
- Low-friction iteration: filters, comparisons, and exports respond within one second and remain reachable within two clicks.

### Layout Overview
- **Global Shell**: sticky header with back navigation, dashboard metadata, and quick actions (`Export`, `Share`, `Edit Layout`).
- **Control Strip**: horizontal filter bar (time range, markets, brands, metrics) using selectable pills plus `Reset`.
- **Section Navigator**: optional left rail listing sections (Overview, Correlations, Media Mix, Benchmarks) with tile counts.
- **Content Canvas**: responsive grid (`display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px`) that supports two columns on desktop and a single column on mobile.
- **Insight Drawer**: optional right-side panel that surfaces selected chart insights, explanations, and pinned notes.

### Tile Library
- **ChartTile**: chart area from `ChartRenderer`, headline metric, last updated badge, and inline sparkline.
- **InsightTile**: short narrative, insight classification badge (e.g., `Correlation`, `Anomaly`), confidence indicator, and link to related chart.
- **ActionTile**: recommendation block with projected impact, required inputs, CTA buttons (e.g., `Mark Done`, `Send to Slack` placeholder).
- **TrendListTile**: bulleted timeline of key movements with delta chips and contextual metadata.

### Interaction Patterns
- **Loading**: skeleton cards (chart, insight, recommendation variants) with shimmer; differentiate initial load vs. filter refetch.
- **Filters**: selecting a pill triggers optimistic UI, displays `Updating…` badge, and fetches data in the background; cancelable operations for long queries.
- **Drill-down**: clicking a chart opens full-screen modal with detail tabs (Visualization, Narrative, Data Table) and ability to pin back to dashboard.
- **Layout Editing**: dedicated mode reveals drag handles and column-span controls (1x or 2x). Persist layout per user via backend configuration.
- **Export**: asynchronous export queue with progress toast; rely on pre-rendered server snapshots where possible to reduce client capture time.

### Responsive & Accessibility Notes
- Breakpoints at 1280px, 1024px, 768px, and 540px with reflow to single column and stacked header.
- Maintain keyboard focus order matching visual order; all interactive tiles expose `aria-labelledby` and `aria-describedby`.
- Provide high-contrast colour tokens and dark-mode parity by leveraging existing theme primitives.

### Empty & Error Handling
- Empty dashboard: onboarding illustration, checklist, and CTA to add charts.
- Empty tile: inline message guiding users to adjust filters or rerun analyses.
- Tile-level error banners with retry button plus global toast for systemic issues.


