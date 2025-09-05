import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Role, UserRole, FoodCourt } from "../models/index.js";
import { Op } from "sequelize";

const JWT_EXPIRES_IN = "1d";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  if (process.env.NODE_ENV === "production") process.exit(1);
}


export const signupUser = async (req, res) => {
  try {
    const { name, email, password, phone, usertype } = req.body;
    if (!name || !email || !password || !phone || !usertype) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      phone,
      usertype,
    });


    const defaultRole =
      usertype === "admin"
        ? await Role.findOne({ where: { name: "admin" } })
        : await Role.findOne({ where: { name: "customer" } });

    if (defaultRole) {
      await UserRole.create({ user_id: newUser.id, role_id: defaultRole.id });
    }


    const token = jwt.sign(
      { id: newUser.id, role: newUser.usertype, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: "User registered successfully!",
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup." });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ error: "Email/Phone and password are required." });
    }

    const user = await User.findOne({
      where: { [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }] },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email/phone or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email/phone or password." });
    }

    let foodcourts = [];
    if (user.usertype === "admin") {
      foodcourts = await FoodCourt.findAll({ where: { user_id: user.id } });
    }

    const token = jwt.sign(
      { id: user.id, role: user.usertype, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: "Login successful!",
      user: userWithoutPassword,
      token,
      foodcourts,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
