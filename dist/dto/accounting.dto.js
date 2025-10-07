"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingTotals = exports.GetAccountingQueryDto = exports.UpdateAccountingDto = exports.CreateAccountingDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BaseFilter_dto_1 = require("./BaseFilter.dto");
const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;
class CreateAccountingDto {
}
exports.CreateAccountingDto = CreateAccountingDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], CreateAccountingDto.prototype, "achatProduits", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], CreateAccountingDto.prototype, "ads", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], CreateAccountingDto.prototype, "emballage", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], CreateAccountingDto.prototype, "salaires", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], CreateAccountingDto.prototype, "abonnementTel", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], CreateAccountingDto.prototype, "autre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CreateAccountingDto.prototype, "commentaire", void 0);
class UpdateAccountingDto {
}
exports.UpdateAccountingDto = UpdateAccountingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "achatProduits", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "ads", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "emballage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "salaires", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "abonnementTel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(DECIMAL_REGEX, { message: "price must be a number" }),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "autre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAccountingDto.prototype, "commentaire", void 0);
class GetAccountingQueryDto extends BaseFilter_dto_1.BaseFilterDto {
}
exports.GetAccountingQueryDto = GetAccountingQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetAccountingQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], GetAccountingQueryDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetAccountingQueryDto.prototype, "minTotal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetAccountingQueryDto.prototype, "maxTotal", void 0);
class AccountingTotals {
}
exports.AccountingTotals = AccountingTotals;
