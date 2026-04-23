import { Router } from "express";

import { addAppliances,getAppliances,updateAppliance,deleteAppliance } from "../controllers/appliance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const applianceRouter = Router();

applianceRouter.post('/appliances',protect,addAppliances);
applianceRouter.get('/appliances',protect,getAppliances);
applianceRouter.put('/appliances/:id',protect,updateAppliance);
applianceRouter.delete('/appliances/:id',protect,deleteAppliance);

export default applianceRouter;
