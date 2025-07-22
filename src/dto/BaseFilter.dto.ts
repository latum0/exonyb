import { IsOptional, IsInt, Min, IsDateString, IsString } from 'class-validator';

export class BaseFilterDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    perPage?: number;

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @IsOptional()
    @IsString()
    search?: string;
}