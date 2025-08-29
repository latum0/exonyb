import { IsDateString, IsOptional, IsString } from "class-validator";


export class BaseStatDto {
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @IsOptional()
    @IsDateString()
    denominatorPeriodStart?: string;

    @IsOptional()
    @IsDateString()
    denominatorPeriodEnd?: string;


    @IsOptional()
    @IsString()
    produitId?: string;

}



export class StatistiquesCommandeDto extends BaseStatDto { }

export class StatistiquesClientDto extends BaseStatDto {
    @IsOptional()
    @IsString()
    commandeId?: string;

}


export class StatistiquesRetourDto extends BaseStatDto {
    @IsOptional()
    @IsString()
    clientId?: string;
}
