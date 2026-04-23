import { Router } from "express";

import { addBills,getBills,getBill,deleteBill,uploadBill } from "../controllers/bill.controller.js";
import { uploadBillFile } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const billRouter = Router();

billRouter.post('/bills',protect,addBills);
billRouter.get('/bills',protect,getBills);
billRouter.get('/bills/:id',protect,getBill);
billRouter.delete('/bills/:id',protect,deleteBill);
billRouter.post('/upload',protect,uploadBillFile.single("bill"),uploadBill);

export default billRouter;