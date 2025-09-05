import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Table = sequelize.define("Table", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  number: { type: DataTypes.STRING, allowNull: false },   
  capacity: { type: DataTypes.INTEGER, allowNull: false }, 
  foodcourt_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "tables",
  timestamps: true,
});

export default Table;
