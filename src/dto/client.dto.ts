// src/dto/client.dto.ts
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CommentaireDto } from "./commentaire.dto";

export class CreateClientDto {
  @IsString() nom!: string;
  @IsString() prenom!: string;
  @IsString() adresse!: string;
  @IsEmail() email!: string;
  @IsString() numeroTelephone!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentaireDto)
  commentaires?: CommentaireDto[];

  @IsString() statut!: string;

  constructor(data?: Partial<CreateClientDto>) {
    if (data) {
      Object.assign(this, data);
      if (data.commentaires) {
        this.commentaires = data.commentaires.map(
          (c) => new CommentaireDto(c)
        );
      }
    }
  }
}

export class UpdateClientDto {
  @IsOptional() @IsString() nom?: string;
  @IsOptional() @IsString() prenom?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() numeroTelephone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentaireDto)
  commentaires?: CommentaireDto[];

  @IsOptional() @IsString() statut?: string;

  constructor(data?: Partial<UpdateClientDto>) {
    if (data) {
      Object.assign(this, data);
      if (data.commentaires) {
        this.commentaires = data.commentaires.map(
          (c) => new CommentaireDto(c)
        );
      }
    }
  }
}
