import rateLimit from "express-rate-limit";

const errorResponse = (msg: string) => ({
  success: false,
  message: msg,
  error: { code: "RATE_LIMIT_EXCEEDED" },
});

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many login attempts. Please try again after 1 minute."),
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many registration attempts. Please try again after 1 minute."),
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many password reset requests. Please try again after 1 minute."),
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorResponse("Too many reset attempts. Please try again after 1 minute."),
});
