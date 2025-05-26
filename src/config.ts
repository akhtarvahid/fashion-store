import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV || "dev"}` }); // Load BEFORE exporting

// Load environment variables
dotenv.config();
export const getTypeOrmConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || "5432"),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  // synchronize: process.env.NODE_ENV !== "prod", // false in production
  synchronize: false, // false in production
  entities: [__dirname + "/**/*.entity{.ts,.js}"],
  migrationsRun: false, // auto-run migrations on app start disabled
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations",
  ssl:
    process.env.NODE_ENV === "prod"
      ? {
          ca: process.env.DB_SSL_CA,
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "true", // false by default
        }
      : false,
};
