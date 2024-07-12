import express from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import YAML from "yamljs";
import { migrateToLatest } from "./migrate";
import router, * as r from "./router";
import { authMiddleware } from "./middleware";
import { config } from "./config";
import path from "path";

let app = express();

app.use((req, res) => {
  console.log(`[${req.method}] ${req.url}`);
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(router);

// * ---- Requiring authorization routes ----
app.use(authMiddleware);
app.get("/", async (req, res) => {
  res.send(`Hello fellow user ${req.cookies["user"].name}`);
});

app.listen(config.server.port, () => {
  migrateToLatest();
  console.log(
    `Server is running on  ${config.server.host}:${config.server.port}`
  );
});
