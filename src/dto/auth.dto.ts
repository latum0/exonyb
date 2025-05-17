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
