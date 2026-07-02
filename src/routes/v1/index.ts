import { Router } from "express";

import { healthRouter } from "./health.routes";
import { authRouter } from "../../auth/auth.routes";
import { usersRouter } from "../../users/users.routes";
import { companyProfileRouter } from "../../company-profile/company-profile.routes";
import { gstinLookupRouter } from "../../gstin-lookup/gstin-lookup.routes";
import { erpRouter } from "./erp.routes";
import { pdfRouter } from "../../pdf/pdf.routes";
import { subscriptionsRouter, subscriptionsWebhookRouter } from "../../subscriptions/subscriptions.routes";
import { featureGateRouter } from "../../feature-gate/feature-gate.routes";
import { tenantsRouter } from "../../tenants/tenants.routes";

const v1Router = Router();

v1Router.use(healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/tenants", tenantsRouter);
v1Router.use("/company-profile", companyProfileRouter);
v1Router.use("/gstin-lookup", gstinLookupRouter);
v1Router.use("/erp", erpRouter);
v1Router.use("/pdf", pdfRouter);
v1Router.use("/subscriptions", subscriptionsRouter);
v1Router.use(subscriptionsWebhookRouter);
v1Router.use("/plan", featureGateRouter);

export { v1Router };