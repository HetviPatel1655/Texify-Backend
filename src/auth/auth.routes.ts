import { Router } from "express";

import { register, login, me, refresh } from "./auth.controller";
import { validateBody } from "../common/middleware/validateBody";
import { registerSchema, loginSchema, refreshSchema } from "./auth.validators";
import { authMiddleware } from "./auth.middleware";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.get("/me", authMiddleware, me);

export { router as authRouter };
