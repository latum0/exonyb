
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { CommentaireDto } from "./commentaire.dto";
import { ClientStatut } from "@prisma/client";

export class CreateClientDto {
  @IsString() @IsNotEmpty() nom!: string;
  @IsString() @IsNotEmpty() prenom!: string;
  @IsString() @IsNotEmpty() adresse!: string;
  @IsEmail({}, { message: "Invalid email adderss" }) @IsOptional() email!: string;
  @IsString() @IsNotEmpty()
  @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
    message: "Numéro de téléphone algérien invalide",
  })
  numeroTelephone!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentaireDto)
  commentaires?: CommentaireDto[];

  @IsString() @IsNotEmpty() statut!: ClientStatut;

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
  @IsOptional() @IsEmail({}, { message: "Invalid email address" }) email?: string;
  @IsString() @IsOptional()
  @Matches(/^(\+213|0)(5|6|7)[0-9]{8}$/, {
    message: "Numéro de téléphone algérien invalide",
  })
  numeroTelephone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentaireDto)
  commentaires?: CommentaireDto[];

  @IsOptional() @IsString() statut?: ClientStatut;

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
