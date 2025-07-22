import { IsEmail, IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { BaseFilterDto } from "./BaseFilter.dto";
import { ClientStatut } from "@prisma/client";



export class ClientFilterDto extends BaseFilterDto {
    @IsOptional()
    @IsString()
    nom?: string;

    @IsOptional()
    @IsString()
    prenom?: string;

    @IsOptional()
    @IsString()
    adresse?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @Matches(/^\+?\d{7,15}$/, {
        message: 'numeroTelephone must be a valid phone number',
    })
    numeroTelephone?: string;

    @IsOptional()
    @IsEnum(ClientStatut)
    statut?: ClientStatut;
}
