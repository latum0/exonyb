import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateHistoriqueDto {
    @IsDate() @IsNotEmpty() dateModification!: Date;
    @IsOptional() @IsString() acteur?: string;
    @IsString() @IsNotEmpty() descriptionAction!: string;
    @IsNumber() @IsNotEmpty() utilisateurId!: number;
}