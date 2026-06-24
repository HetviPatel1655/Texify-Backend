import { Router } from "express";

import { partiesRouter } from "../../parties/parties.routes";
import { productsRouter } from "../../products/products.routes";
import { invoicesRouter } from "../../invoices/invoices.routes";
import { challansRouter } from "../../challans/challans.routes";
import { purchaseOrdersRouter } from "../../purchase-orders/purchase-orders.routes";
import { saleOrdersRouter } from "../../sale-orders/sale-orders.routes";
import { yarnPurchasesRouter } from "../../yarn-purchases/yarn-purchases.routes";
import { yarnIssuesRouter } from "../../yarn-issues/yarn-issues.routes";
import { beamsRouter } from "../../beams/beams.routes";
import { beamSendJobworkRouter } from "../../beam-send-jobwork/beam-send-jobwork.routes";
import { takasRouter } from "../../takas/takas.routes";
import { greyTPRouter } from "../../grey-tp/grey-tp.routes";
import { returnTakasRouter } from "../../return-takas/return-takas.routes";
import { dashboardRouter } from "../../dashboard/dashboard.routes";

const erpRouter = Router();

erpRouter.use("/dashboard", dashboardRouter);
erpRouter.use("/parties", partiesRouter);
erpRouter.use("/products", productsRouter);
erpRouter.use("/invoices", invoicesRouter);
erpRouter.use("/challans", challansRouter);
erpRouter.use("/purchase-orders", purchaseOrdersRouter);
erpRouter.use("/sale-orders", saleOrdersRouter);
erpRouter.use("/yarn-purchases", yarnPurchasesRouter);
erpRouter.use("/yarn-issues", yarnIssuesRouter);
erpRouter.use("/beams", beamsRouter);
erpRouter.use("/beam-send-jobwork", beamSendJobworkRouter);
erpRouter.use("/takas", takasRouter);
erpRouter.use("/grey-tp", greyTPRouter);
erpRouter.use("/return-takas", returnTakasRouter);

export { erpRouter };
