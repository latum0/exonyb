"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmailVerificationToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokens = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are not defined in environment variables");
}
const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, accessSecret, {
        expiresIn: accessExpiresIn,
    });
    const refreshToken = jwt.sign(payload, refreshSecret, {
        expiresIn: refreshExpiresIn,
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyAccessToken = (token) => jwt.verify(token, accessSecret);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret);
exports.verifyRefreshToken = verifyRefreshToken;
const generateEmailVerificationToken = (userId) => {
    return jwt.sign({ sub: userId }, accessSecret, {
        expiresIn: "1h",
    });
};
exports.generateEmailVerificationToken = generateEmailVerificationToken;
