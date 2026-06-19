import { Router } from "express";

import { register, login, me, refresh, forgotPassword, resetPassword, changePassword } from "./auth.controller";
import { validateBody } from "../common/middleware/validateBody";
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "./auth.validators";
import { authMiddleware } from "./auth.middleware";
import { loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../common/middleware/rateLimiter";

const router = Router();

router.post("/register", registerLimiter, validateBody(registerSchema), register);
router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.get("/me", authMiddleware, me);
router.post("/forgot-password", forgotPasswordLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validateBody(resetPasswordSchema), resetPassword);
router.post("/change-password", authMiddleware, validateBody(changePasswordSchema), changePassword);

export { router as authRouter };
