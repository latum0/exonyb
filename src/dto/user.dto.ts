import { Permission } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsArray,
  ArrayNotEmpty,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
  @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
  @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
  @Matches(/[^A-Za-z0-9]/, {
    message: "Le mot de passe doit contenir un caractère spécial",
  })
  password!: string;

  @IsString()
  @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
    message: "Numéro de téléphone algérien invalide",
  })
  phone!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}
export class UpdatePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}
