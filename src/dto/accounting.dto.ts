import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, Max, Min } from "class-validator";
import { BaseFilterDto } from "./BaseFilter.dto";

const DECIMAL_REGEX = /^\d+(\.\d{1,2})?$/;

export class CreateAccountingDto {
    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    achatProduits!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    ads!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    emballage!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    salaires!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    abonnementTel!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    autre!: string;

    @IsOptional()
    @IsString()
    commentaire?: string | null;

}



export class UpdateAccountingDto {
    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    achatProduits?: string;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    ads?: string;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    emballage?: string;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    salaires?: string;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    abonnementTel?: string;

    @IsOptional()
    @IsString()
    @Matches(DECIMAL_REGEX, { message: "price must be a number" })
    autre?: string;

    @IsOptional()
    @IsString()
    commentaire?: string;

}


export class GetAccountingQueryDto extends BaseFilterDto {


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
    id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    minTotal?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxTotal?: number;

}


export class AccountingTotals {
    achatProduitsTotal!: string | null;
    adsTotal!: string | null;
    emballageTotal!: string | null;
    abonnementTelTotal!: string | null;
    autreTotal!: string | null;
    salairesTotal!: string | null;
    totalDate!: string;
}