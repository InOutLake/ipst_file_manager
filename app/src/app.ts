import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { migrateToLatest } from "./migrate";
import router, * as r from "./router";
import { config } from "./config";
import path from "path";

let app = express();

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(router);

app.listen(config.server.port, () => {
  migrateToLatest();
  console.log(
    `Server is running on  ${config.server.host}:${config.server.port}`
  );
});
