import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserRole = sequelize.define("UserRole", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "user_roles",
  timestamps: true,
});

export default UserRole;
