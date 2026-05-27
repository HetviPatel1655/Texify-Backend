import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, (req, res) => {
  return res.json({ success: true, data: { user: (req as any).user } });
});

export { router as usersRouter };
