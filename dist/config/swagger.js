"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const path_1 = require("path");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "Description de mon API",
        },
    },
    apis: [(0, path_1.join)(__dirname, "../routes/*.ts"), (0, path_1.join)(__dirname, "../models/*.ts")],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
