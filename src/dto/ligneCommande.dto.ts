import { Type } from "class-transformer";
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Matches,
} from "class-validator";

const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class CreateLigneCommandeDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    quantite!: number;


    @IsNotEmpty()
    @IsUUID()
    produitId!: string;
}

export class UpdateLigneCommandeDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    quantite?: number;


    @IsOptional()
    @IsUUID()
    produitId?: string;
}

export enum LineOperation {
    ADD = "add",
    UPDATE = "update",
    REMOVE = "remove",
}

export class UpdateLinePatchDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    quantite?: number;

    @IsNotEmpty()
    @IsUUID()
    produitId!: string;

    @IsNotEmpty()
    @IsEnum(LineOperation, { message: "op must be one of: add, update, delete" })
    op!: LineOperation;
}


export class UpdateQuantityLigneDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    quantite!: number;
}

export class UpdatePrixUnitaireLigneDto {
    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "Le prix unitaire doit être un nombre décimal valide" })
    prixUnitaire!: string;

}

