import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./common/errors/errorHandler";
import { notFoundHandler } from "./common/middleware/notFound";
import { requestLogger } from "./common/middleware/requestLogger";
import { apiRouter } from "./routes";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "texify backend is running"
  });
});

app.use(apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };