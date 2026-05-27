import { Router } from "express";

import { healthRouter } from "./health.routes";
import { authRouter } from "../../auth/auth.routes";
import { usersRouter } from "../../users/users.routes";
import { erpRouter } from "./erp.routes";

const v1Router = Router();

v1Router.use(healthRouter);
v1Router.use("/auth", authRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/erp", erpRouter);

export { v1Router };