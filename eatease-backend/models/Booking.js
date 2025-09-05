import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  guest_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "booked" },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "users", key: "id" } },
  table_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "tables", key: "id" } },
}, {
  tableName: "bookings",
  timestamps: true,
});

export default Booking;
