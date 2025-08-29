import { Type } from 'class-transformer';
import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { BaseFilterDto } from './BaseFilter.dto';
import { UpdateClientDto } from './client.dto';

export class ClientFilterDto extends IntersectionType(
    BaseFilterDto,
    PartialType(UpdateClientDto),
) {

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    phonePrefix?: string;

    @IsOptional()
    @IsString()
    cursorNom?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    cursorId?: number;
}
