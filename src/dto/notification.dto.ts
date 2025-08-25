import { Type } from "class-transformer";
import {
    IsUUID,
    IsString,
    IsOptional,
    IsEnum,
    MaxLength,
    IsBoolean,
    IsDate,
    IsInt,
    Min,
    IsIn,
} from "class-validator";

export enum NotificationType {
    OUT_OF_STOCK = "OUT_OF_STOCK",
    LOW_STOCK = "LOW_STOCK"
}

export class CreateNotificationDto {
    @IsUUID()
    produitId!: string;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType = NotificationType.OUT_OF_STOCK;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    message?: string;
}


export class UpdateNotificationDto {
    @IsOptional()
    @IsBoolean()
    resolved?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    message?: string;
}

export class NotificationQueryDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    limit?: number = 25;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsUUID()
    produitId?: string;

    @IsOptional()
    @IsIn(["true", "false", "1", "0", true, false])
    resolved?: boolean | string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateFrom?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateTo?: Date;

    @IsOptional()
    @IsIn(["createdAt", "type", "produitId"])
    orderBy?: "createdAt" | "type" | "produitId" = "createdAt";

    @IsOptional()
    @IsIn(["asc", "desc"])
    orderDir?: "asc" | "desc" = "desc";
}
