import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";



export class CreateHistoriqueDto {
    @IsDate() @IsNotEmpty() dateModification!: Date;
    @IsString() @IsNotEmpty() acteur!: string;
    @IsString() @IsNotEmpty() descriptionAction!: string;
    @IsNumber() @IsNotEmpty() utilisateurId!: number;
}