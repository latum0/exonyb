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
    quantite?: number;
    prixUnitaire!: string;
    commandeId?: string;
};

export class CommandeResponseDto {
    idCommande?: string;
    dateCommande?: Date;
    statut!: string;
    adresseLivraison!: string;
    montantTotal!: string;
    clientId!: number;
    ligne?: LigneResponseDto[];
}

export class CommandeListResponseDto {
    commandes!: CommandeResponseDto[];
    total!: number;
    page!: number;
    limit!: number;
    totalPages!: number;
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


