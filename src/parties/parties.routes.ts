import { Router } from "express";

import { authMiddleware } from "../auth/auth.middleware";
import { validateBody, validateQuery } from "../common/middleware/validateBody";
import { featureGate } from "../feature-gate/feature-gate.middleware";
import { createPartySchema, listPartyQuerySchema, updatePartySchema } from "./parties.validators";
import { createParty, deleteParty, getPartyById, listParties, updateParty } from "./parties.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", validateQuery(listPartyQuerySchema), listParties);
router.get("/:id", getPartyById);
router.post("/", featureGate("parties:create"), validateBody(createPartySchema), createParty);
router.patch("/:id", validateBody(updatePartySchema), updateParty);
router.delete("/:id", deleteParty);

export { router as partiesRouter };
