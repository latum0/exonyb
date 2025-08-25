import { Type } from "class-transformer";
import {
    ArrayMinSize,
    IsArray,
    IsDate,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
    ValidateNested,
} from "class-validator";
import { CreateLigneCommandeDto, UpdateLigneCommandeDto, UpdateLinePatchDto } from "./ligneCommande.dto";
import { BaseFilterDto } from "./BaseFilter.dto";

export class CreateCommandeDto {
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateCommande?: Date;

    @IsNotEmpty()
    @IsString()
    statut!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    adresseLivraison!: string;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    clientId!: number;

    @IsArray()
    @ArrayMinSize(1, { message: "Commande must contain at least one ligne" })
    @ValidateNested({ each: true })
    @Type(() => CreateLigneCommandeDto)
    lignes!: CreateLigneCommandeDto[];
}

export class UpdateCommandeDto {

    @IsOptional()
    @IsString()
    statut?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    adresseLivraison?: string;


    @IsOptional()
    @IsInt()
    @IsPositive()
    clientId?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateLigneCommandeDto)
    lignes?: UpdateLinePatchDto[];
}




export class GetCommandesQueryDto extends BaseFilterDto {


    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    clientId?: number;

    @IsOptional()
    @IsString()
    statut?: string;

    @IsOptional()
    @IsUUID()
    produitId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minTotal?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxTotal?: number;

    @IsOptional()
    @IsIn(["dateCommande", "montantTotal", "clientId"])
    orderBy?: "dateCommande" | "montantTotal" | "clientId";

    @IsOptional()
    @IsIn(["asc", "desc"])
    orderDir?: "asc" | "desc";
}
