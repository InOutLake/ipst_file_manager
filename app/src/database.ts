import { Database } from "./types/types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { config } from "./config";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: config.db.database,
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    port: config.db.db_port,
    max: config.db.max_tries,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
