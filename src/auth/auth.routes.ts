import { Router } from "express";

import { register, login, me } from "./auth.controller";
import { validateBody } from "../common/middleware/validateBody";
import { registerSchema, loginSchema } from "./auth.validators";
import { authMiddleware } from "./auth.middleware";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authMiddleware, me);

export { router as authRouter };
