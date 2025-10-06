import { NotificationType } from "./notification.dto";

export class ClientSummaryDto {
  nom!: string;
  prenom!: string;
  numeroTelephone!: string;
}

export class CommandeSummaryDto {
  statut!: string;
  montantTotal!: string;
}

export class ProduitSummaryDto {
  nom!: string;
  prix!: number;
}

export class LigneResponseDto {
  idLigne!: number;
  produitId?: string;
  produit?: string;
  quantite?: number;
  prixUnitaire!: string;
  commandeId?: string;
}

export class CommandeResponseDto {
  idCommande?: string;
  dateCommande?: Date;
  statut!: string;
  qrSVG?: string | null;
  adresseLivraison!: string;
  montantTotal!: string;
  clientId!: number;
  client?: string;
  ligne?: LigneResponseDto[];
}

export class CommandeListResponseDto {
  commandes!: CommandeResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;

  }

}

export class NotificationResponseDto {
  id!: string;
  produitId!: string;
  type!: NotificationType;
  message!: string;
  createdAt!: Date;
  resolved!: boolean;
}

export class UserResponseDto {
  name!: string;
  email!: string;
  phone!: string;
}



export class AccountingResponseDto {
  id!: number;
  achatProduits!: string;
  ads!: string;
  emballage!: string;
  salaires!: string;
  abonnementTel!: string;
  autre!: string;
  commentaire?: string | null;
  total!: string;
  createdAt?: string
}

export class AccountingListResponseDto {
  accountings!: AccountingResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}


