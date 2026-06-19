import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware.js";
import { validateBody } from "../common/middleware/validateBody.js";
import { createSubscriptionSchema, verifySubscriptionSchema, cancelSubscriptionSchema } from "./subscriptions.validators.js";
import * as controller from "./subscriptions.controller.js";

const subscriptionsRouter = Router();

subscriptionsRouter.use(authMiddleware);
subscriptionsRouter.get("/", controller.getSubscription);
subscriptionsRouter.post("/", validateBody(createSubscriptionSchema), controller.createSubscription);
subscriptionsRouter.post("/verify", validateBody(verifySubscriptionSchema), controller.verifySubscription);
subscriptionsRouter.post("/cancel", validateBody(cancelSubscriptionSchema), controller.cancelSubscription);

const subscriptionsWebhookRouter = Router();
subscriptionsWebhookRouter.post("/subscriptions/webhook", controller.webhook);

export { subscriptionsRouter, subscriptionsWebhookRouter };
