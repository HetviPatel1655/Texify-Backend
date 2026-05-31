import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody } from "../common/middleware/validateBody";
import { upsertCompanyProfileSchema } from "./company-profile.validators";
import { getCompanyProfile, upsertCompanyProfile } from "./company-profile.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getCompanyProfile);
router.put("/", validateBody(upsertCompanyProfileSchema), upsertCompanyProfile);

export { router as companyProfileRouter };
