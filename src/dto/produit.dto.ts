import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateProduitDto {
  @IsString()
  nom!: string;

  @IsString()
  description!: string;

  @IsNumber()
  prix!: number;

  @IsNumber()
  stock!: number;

  @IsNumber()
  @IsOptional()
  remise?: number;

  @IsString()
  marque!: string;

  @IsString()
  categorie!: string;
}
