"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPermissionsController = exports.getUserByIdController = exports.createUserController = void 0;
exports.getAllUsersController = getAllUsersController;
exports.deleteUserController = deleteUserController;
const user_dto_1 = require("../dto/user.dto");
const users_service_1 = require("../services/users.service");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const createUserController = async (req, res) => {
    const dto = req.body;
    const user = await (0, users_service_1.createUser)(dto);
    res.status(201).json(user);
};
exports.createUserController = createUserController;
async function getAllUsersController(req, res) {
    const result = await (0, users_service_1.getAllUsers)();
    res.status(result.statusCode).json(result);
}
const getUserByIdController = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    try {
        const user = await (0, users_service_1.getUserByIdService)(id);
        if (!user) {
            return res
                .status(404)
                .json({ statusCode: 404, message: "Utilisateur non trouvé" });
        }
        res.status(200).json({ statusCode: 200, user });
    }
    catch (error) {
        console.error("Error in getUserByIdController:", error);
        res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
};
exports.getUserByIdController = getUserByIdController;
const updateUserPermissionsController = async (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }
    const dto = (0, class_transformer_1.plainToInstance)(user_dto_1.UpdatePermissionsDto, req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res
            .status(400)
            .json({ statusCode: 400, message: "Validation failed", errors });
    }
    const result = await (0, users_service_1.updateUserPermissionsService)(userId, dto.permissions);
    return res.status(result.statusCode).json({
        statusCode: result.statusCode,
        message: result.message,
    });
};
exports.updateUserPermissionsController = updateUserPermissionsController;
async function deleteUserController(req, res) {
    const userId = Number(req.params.id);
    const result = await (0, users_service_1.deleteUserById)(userId);
    res.status(result.statusCode).json({
        statusCode: result.statusCode,
        message: result.message,
    });
}
