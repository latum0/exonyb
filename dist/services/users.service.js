"use strict";
//services/users.service
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPermissionsService = exports.getUserByIdService = void 0;
exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.deleteUserById = deleteUserById;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../utils/tokens");
const email_1 = require("../utils/email");
const prisma = new client_1.PrismaClient();
async function createUser(data) {
    const emailExists = await prisma.users.findUnique({
        where: { email: data.email },
    });
    if (emailExists) {
        return {
            statusCode: 409,
            message: "email Déjà exist",
        };
    }
    const phoneExists = await prisma.users.findUnique({
        where: { phone: data.phone },
    });
    if (phoneExists) {
        return {
            statusCode: 409,
            message: "Phone Déjà exist",
        };
    }
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const user = await prisma.users.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            phone: data.phone,
            role: client_1.Role.MANAGER,
            permissions: data.permissions,
        },
    });
    const token = (0, tokens_1.generateEmailVerificationToken)(user.id);
    await (0, email_1.sendVerificationEmail)(user.email, token);
    return {
        statusCode: 201,
        message: "Utilisateur créé. Un email de vérification a été envoyé.",
    };
}
async function getAllUsers() {
    const users = await prisma.users.findMany({
        where: {
            role: client_1.Role.MANAGER,
        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            permissions: true,
            emailVerified: true,
        },
    });
    return {
        statusCode: 200,
        users,
    };
}
const getUserByIdService = async (id) => {
    return prisma.users.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            permissions: true,
        },
    });
};
exports.getUserByIdService = getUserByIdService;
const updateUserPermissionsService = async (userId, permissions) => {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user || user.role !== client_1.Role.MANAGER) {
        return {
            success: false,
            statusCode: 404,
            message: "User not found or user is not a MANAGER",
        };
    }
    const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: { permissions },
    });
    return {
        success: true,
        statusCode: 200,
        message: "Permissions updated successfully",
    };
};
exports.updateUserPermissionsService = updateUserPermissionsService;
async function deleteUserById(userId) {
    const user = await prisma.users.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return {
            statusCode: 404,
            message: `Utilisateur non trouvé.`,
        };
    }
    if (user.role !== client_1.Role.MANAGER) {
        return {
            statusCode: 403,
            message: `Vous n'avez pas la permission de supprimer cet utilisateur.`,
        };
    }
    await prisma.users.delete({
        where: { id: userId },
    });
    return {
        statusCode: 200,
        message: `Utilisateur supprimé avec succès.`,
    };
}
