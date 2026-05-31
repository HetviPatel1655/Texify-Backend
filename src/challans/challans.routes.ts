import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody } from "../common/middleware/validateBody";
import { validateQuery } from "../common/middleware/validateQuery";
import { createChallanSchema, listChallanQuerySchema, updateChallanSchema } from "./challans.validators";
import { createChallan, deleteChallan, getChallanById, listChallans, updateChallan } from "./challans.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listChallanQuerySchema), listChallans);
router.get("/:id", getChallanById);
router.post("/", validateBody(createChallanSchema), createChallan);
router.patch("/:id", validateBody(updateChallanSchema), updateChallan);
router.delete("/:id", deleteChallan);

export { router as challansRouter };
