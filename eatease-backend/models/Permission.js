import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Permission = sequelize.define("Permission", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }, 
}, {
  tableName: "permissions",
  timestamps: true,
});

export default Permission;
