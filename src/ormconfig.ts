import { getTypeOrmConfig } from "./config";
const { DataSource } = require("typeorm");
module.exports = new DataSource(getTypeOrmConfig);
