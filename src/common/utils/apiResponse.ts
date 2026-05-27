import type { Response } from "express";

export const ApiResponse = {
  ok(res: Response, message: string, data?: unknown) {
    return res.status(200).json({ success: true, message, data });
  },
  created(res: Response, message: string, data?: unknown) {
    return res.status(201).json({ success: true, message, data });
  },
  noContent(res: Response) {
    return res.status(204).send();
  }
};
