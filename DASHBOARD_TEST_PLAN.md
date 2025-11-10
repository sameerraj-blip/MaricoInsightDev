## Dashboard Revamp Test Plan

### Scope
- Validate the redesigned dashboard layout renders existing chart content without regressions.
- Ensure CRUD operations on dashboards continue to function with the new state management layer.
- Confirm PPT export still emits the expected slides and narratives.

### Manual Test Scenarios
1. **Dashboard List Loading**
   - Clear browser cache, navigate to dashboard list.
   - Expect skeleton cards while data loads, auto-refresh badge during `refetch`.
2. **View Dashboard**
   - Open dashboard containing charts, verify header metadata, filter strip, section navigator, and tile grid.
   - Resize window across breakpoints (1280, 1024, 768, 540) and confirm responsive layout.
3. **Tile Content**
   - For each chart tile confirm matching insight and recommendation tiles render when data exists.
   - Use delete button to remove chart; expect confirmation modal, updated view, and persisted change.
4. **Export PPT**
   - Trigger export; ensure toast feedback and resulting file includes chart image, insight, and recommendation text per slide.
5. **Empty States**
   - Create dashboard with no charts; verify empty dashboard illustration and CTA.
   - Remove all dashboards; confirm onboarding empty list UI.
6. **Error Handling**
   - Simulate API failure (disconnect network), ensure list displays skeleton then appropriate fallback (console error, toast).
7. **Performance**
   - Switch between dashboards; ensure cached data loads without skeleton, `Updating…` badge shows during background fetch.

### Automation Opportunities
- Add React Testing Library smoke test verifying `DashboardView` renders chart, insight, recommendation tiles from mock data.
- Snapshot tests for `DashboardList` skeleton state.
- Integration test mocking PPT export utility to assert slide metadata generation.


