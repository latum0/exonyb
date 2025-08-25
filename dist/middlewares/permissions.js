"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermissions = exports.Permission = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["MANAGER"] = "MANAGER";
})(Role || (exports.Role = Role = {}));
var Permission;
(function (Permission) {
    Permission["AGENT_DE_STOCK"] = "AGENT_DE_STOCK";
    Permission["CONFIRMATEUR"] = "CONFIRMATEUR";
    Permission["SAV"] = "SAV";
})(Permission || (exports.Permission = Permission = {}));
const checkPermissions = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return; // 👈 corrige le type
        }
        const { role, permissions } = req.user;
        if (role === Role.ADMIN) {
            next();
            return;
        }
        const hasPermission = permissions?.some((p) => requiredPermissions.includes(p));
        if (!hasPermission) {
            res.status(403).json({ message: "Forbidden: insufficient permissions" });
            return;
        }
        next();
    };
};
exports.checkPermissions = checkPermissions;
