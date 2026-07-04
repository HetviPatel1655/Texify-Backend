import { Router } from "express";

import { listTenants, createTenant, switchTenant, deleteTenant } from "./tenants.controller";
import { validateBody } from "../common/middleware/validateBody";
import { createTenantSchema } from "./tenants.validators";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", listTenants);
router.post("/", validateBody(createTenantSchema), createTenant);
router.post("/:tenantId/switch", switchTenant);
router.delete("/:tenantId", deleteTenant);

export { router as tenantsRouter };
