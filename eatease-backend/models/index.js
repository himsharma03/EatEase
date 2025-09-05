import sequelize from "../config/db.js";
import User from "./User.js";
import Table from "./Table.js";
import Booking from "./Booking.js";
import Role from "./Role.js";
import Permission from "./Permission.js";
import UserRole from "./UserRole.js";
import RolePermission from "./RolePermission.js";
import FoodCourt from "./FoodCourt.js";

User.hasMany(FoodCourt, { foreignKey: "user_id", as: "foodcourts", onDelete: "CASCADE" });
FoodCourt.belongsTo(User, { foreignKey: "user_id", as: "owner" });


FoodCourt.hasMany(Table, { foreignKey: "foodcourt_id", as: "tables", onDelete: "CASCADE" });
Table.belongsTo(FoodCourt, { foreignKey: "foodcourt_id", as: "foodcourt" });


Table.hasMany(Booking, { foreignKey: "table_id", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(Table, { foreignKey: "table_id", as: "table" });

User.hasMany(Booking, { foreignKey: "user_id", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "user_id", as: "customer" });


User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id", as: "roles" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id", as: "users" });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "role_id", as: "permissions" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permission_id", as: "roles" });

export { sequelize, User, FoodCourt, Table, Booking, Role, Permission, UserRole, RolePermission };
