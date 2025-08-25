import { BaseFilterDto } from "./BaseFilter.dto";
import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { UpdateClientDto } from "./client.dto";



export class ClientFilterDto extends IntersectionType(
    BaseFilterDto,
    PartialType(UpdateClientDto),
) { }
