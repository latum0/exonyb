"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureExists = ensureExists;
exports.stripNullish = stripNullish;
exports.ensureUnique = ensureUnique;
const errors_1 = require("./errors");
//used to check the existing of a value, otherwise return an error
async function ensureExists(find, entity) {
    const check = await find();
    if (check === null) {
        throw new errors_1.NotFoundError(`${entity}`);
    }
    return check;
}
//deleting null fields
function stripNullish(dto) {
    return Object.fromEntries(Object.entries(dto).filter(([_, v]) => v != null));
}
async function ensureUnique(find, entity) {
    const check = await find();
    if (check) {
        throw new errors_1.ConflictError(`${entity} found`);
    }
}
