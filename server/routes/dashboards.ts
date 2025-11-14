import { Router } from "express";
import {
  addChartToDashboardController,
  addSheetToDashboardController,
  createDashboardController,
  deleteDashboardController,
  getDashboardController,
  listDashboardsController,
  removeChartFromDashboardController,
  removeSheetFromDashboardController,
  renameSheetController,
  renameDashboardController,
  updateChartInsightOrRecommendationController,
} from "../controllers/index.js";

const router = Router();

// Dashboards
router.post('/dashboards', createDashboardController);
router.get('/dashboards', listDashboardsController);
router.get('/dashboards/:dashboardId', getDashboardController);
router.patch('/dashboards/:dashboardId', renameDashboardController);
router.delete('/dashboards/:dashboardId', deleteDashboardController);

// Charts in a dashboard
router.post('/dashboards/:dashboardId/charts', addChartToDashboardController);
router.delete('/dashboards/:dashboardId/charts', removeChartFromDashboardController);
router.patch('/dashboards/:dashboardId/charts/:chartIndex', updateChartInsightOrRecommendationController);

// Sheets in a dashboard
router.post('/dashboards/:dashboardId/sheets', addSheetToDashboardController);
router.delete('/dashboards/:dashboardId/sheets/:sheetId', removeSheetFromDashboardController);
router.patch('/dashboards/:dashboardId/sheets/:sheetId', renameSheetController);

export default router;



