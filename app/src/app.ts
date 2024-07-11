import express from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import YAML from "yamljson";
import { migrateToLatest } from "./migrate";
import { post_register, post_login } from "./routes";
import { authMiddleware } from "./authMiddleware";
import { config } from "./config";

let app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const swaggerDocument = YAML.load("../docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/register", post_register);
app.post("/login", post_login);

// * ---- Requiring authorization routes ----
app.use(authMiddleware);
app.get("/", async (req, res) => {
  res.send(`Hello fellow user ${req.cookies["user"].name}`);
});

app.listen(8000, () => {
  migrateToLatest();
  console.log(
    `Server is running on  ${config.server.host}:${config.server.port}`
  );
});
