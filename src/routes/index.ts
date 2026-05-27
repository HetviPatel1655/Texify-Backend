import { Router } from "express";

import { env } from "../config";
import { v1Router } from "./v1";

const apiRouter = Router();

apiRouter.use(env.API_PREFIX, v1Router);

export { apiRouter };