import { Router } from "express";

import { partiesRouter } from "../../parties/parties.routes";
import { productsRouter } from "../../products/products.routes";
import { invoicesRouter } from "../../invoices/invoices.routes";
import { challansRouter } from "../../challans/challans.routes";
import { dashboardRouter } from "../../dashboard/dashboard.routes";

const erpRouter = Router();

erpRouter.use("/dashboard", dashboardRouter);
erpRouter.use("/parties", partiesRouter);
erpRouter.use("/products", productsRouter);
erpRouter.use("/invoices", invoicesRouter);
erpRouter.use("/challans", challansRouter);

export { erpRouter };
