// src/database/database.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      await this.runMigrations();
    } catch (error) {
      console.error("Migration failed:", error);
      process.exit(1);
    }
  }

  async runMigrations() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    const pendingMigrations = await this.dataSource.showMigrations();
    if (pendingMigrations) {
      console.log("Running pending migrations...");
      await this.dataSource.runMigrations();
      console.log("Migrations completed successfully");
    } else {
      console.log("No pending migrations");
    }
  }
}
