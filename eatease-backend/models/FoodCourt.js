import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const FoodCourt = sequelize.define(
  "FoodCourt",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },       
    location: { type: DataTypes.STRING, allowNull: false },  
    city: { type: DataTypes.STRING, allowNull: false },      
    user_id: { type: DataTypes.INTEGER, allowNull: false },  
  },
  {
    tableName: "foodcourts",
    paranoid: true,
    timestamps: true,
  }
);

export default FoodCourt;
