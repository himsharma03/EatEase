import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import sequelize from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import userRoleRoutes from "./routes/userRoleRoutes.js";
import foodcourtRoutes from "./routes/foodcourtRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

import "./models/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(" WebSocket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log(" WebSocket disconnected:", socket.id);
  });
});

app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/userroles", userRoleRoutes);
app.use("/api/foodcourts", foodcourtRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (_req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;

const syncOptions = process.env.NODE_ENV === "production" ? {} : { alter: true };

sequelize
  .sync(syncOptions)
  .then(() => {
    console.log(" Database synced successfully!");
    server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
  });
