import { IsEmail, IsNotEmpty, IsArray, IsOptional, IsString, Matches } from "class-validator";

export class CreateFournisseurDto {
    @IsString() @IsNotEmpty() nom!: string;
    @IsString() @IsNotEmpty() adresse!: string;
    @IsString() @IsNotEmpty() contact!: string;
    @IsString()
    @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
        message: "Numéro de téléphone algérien invalide",
    })
    @IsNotEmpty()
    telephone!: string;
    @IsEmail({}, { message: "Invalid email address" })
    @IsNotEmpty()
    @IsOptional()
    email!: string;
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    produitIds?: string[];

}

export class UpdateFournisseurDto {
    @IsOptional() @IsString() nom?: string;
    @IsOptional() @IsString() adresse?: string;
    @IsOptional() @IsString() contact?: string;
    @IsOptional()
    @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
        message: "Numéro de téléphone algérien invalide",
    })
    telephone?: string;
    @IsOptional() @IsEmail() email?: string;

}