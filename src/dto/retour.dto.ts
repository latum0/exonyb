import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";



export class CreateRetourDto {
    @IsDateString() dateRetour!: string;
    @IsString() @IsNotEmpty() statutRetour!: string;
    @IsString() @IsNotEmpty() raisonRetour!: string;
    @IsString() @IsNotEmpty() commandeId!: string;

}


export class UpdateRetourDto {
    @IsOptional() @IsDateString() dateRetour?: string;
    @IsOptional() @IsString() statutRetour?: string;
    @IsOptional() @IsString() raisonRetour?: string;
    @IsOptional() @IsString() commandeId?: string;
}