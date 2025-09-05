import { Role, Permission } from "../models/index.js";

export const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const roles = await user.getRoles({
        include: [{ model: Permission, as: "permissions" }]
      });

      const userPermissions = roles.flatMap(role => role.permissions.map(p => p.name));

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ error: "Forbidden: Missing permission" });
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
};
