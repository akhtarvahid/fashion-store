import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TasksModule } from "./tasks/tasks.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { getTypeOrmConfig } from "./config";
import { DatabaseService } from "./db/database.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "dev"}`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        console.log(" - - - - - -Logging... - - - - ");
        console.log(getTypeOrmConfig); // Log here
        return getTypeOrmConfig;
      },
    }),
    TasksModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
