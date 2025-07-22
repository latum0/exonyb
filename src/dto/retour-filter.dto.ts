import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { BaseFilterDto } from './BaseFilter.dto';

export class RetourFilterDto extends BaseFilterDto {
    @IsOptional()
    @IsString()
    statutRetour?: string;

}
