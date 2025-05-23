import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
} from "class-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: StrongP@ssw0rd
 *           description: Must contain uppercase, lowercase, number, and special character
 */
export class LoginDto {
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password!: string;
}
export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}
export class ChangePasswordDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: "Le mot de passe doit contenir une majuscule" })
  @Matches(/[a-z]/, { message: "Le mot de passe doit contenir une minuscule" })
  @Matches(/[0-9]/, { message: "Le mot de passe doit contenir un chiffre" })
  @Matches(/[^A-Za-z0-9]/, {
    message: "Le mot de passe doit contenir un caractère spécial",
  })
  newPassword!: string;
}
