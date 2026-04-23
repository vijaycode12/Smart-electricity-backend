import { Router } from "express";

import { getMonthly,getAppliance,getSuggestions,getPredictions,getAlerts,getEfficiency } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get('/analytics/monthly-usage',protect,getMonthly);
analyticsRouter.get('/analytics/app-breakdown',protect,getAppliance);
analyticsRouter.get('/analytics/predictions',protect,getPredictions);
analyticsRouter.get('/analytics/suggestions',protect,getSuggestions);
analyticsRouter.get('/analytics/alerts',protect,getAlerts);
analyticsRouter.get('/analytics/eff-score',protect,getEfficiency);

export default analyticsRouter;