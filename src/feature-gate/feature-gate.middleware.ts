import type { NextFunction, Request, Response } from "express";
import { FeatureGateService, type Feature } from "./feature-gate.service";

export function featureGate(feature: Feature) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { tenantId } = (req as any).user;
      await FeatureGateService.checkFeature(tenantId, feature);
      next();
    } catch (err) {
      next(err);
    }
  };
}
