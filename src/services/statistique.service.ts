import { StatistiquesClientDto, StatistiquesCommandeDto, StatistiquesRetourDto } from "../dto/statistiques.dto";
import prisma from "../prisma";


export function dateHelper(where: any, dateFrom?: any, dateTo?: any, dateField = 'dateCommande') {
  if (dateFrom || dateTo) {
    where[dateField] = {};
    if (dateFrom) where[dateField].gte = new Date(dateFrom);
    if (dateTo) where[dateField].lte = new Date(dateTo);
  }
  return where;
}

function toDateOrUndefined(v?: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${v}`);
  return d;
}

export async function commandeParDateParProduit(
  query: StatistiquesCommandeDto
): Promise<ServiceResponse<{ percentage: number; windowCount: number; totalCount: number }>> {
  const dateFrom = toDateOrUndefined(query.dateFrom);
  const dateTo = toDateOrUndefined(query.dateTo);
  const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
  const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);

  const whereWindow: any = {};
  dateHelper(whereWindow, dateFrom, dateTo, 'dateCommande');
  if (query.produitId) whereWindow.lignesCommande = { some: { produitId: query.produitId } };

  const whereTotal: any = {};
  if (denomFrom || denomTo) {
    dateHelper(whereTotal, denomFrom, denomTo, 'dateCommande');
  }

  const [windowCount, totalCount] = await Promise.all([
    prisma.commande.count({ where: whereWindow }),
    prisma.commande.count({ where: whereTotal }),
  ]);

  const percentage = totalCount === 0 ? 0 : Number(((windowCount / totalCount) * 100).toFixed(2));
  return { statusCode: 200, data: { percentage, windowCount, totalCount } };
}
export async function ClientsParProduitParDate(
  query: StatistiquesClientDto
): Promise<ServiceResponse<{ percentage: number; clientCountWindow: number; clientCountTotal: number }>> {
  const dateFrom = toDateOrUndefined(query.dateFrom);
  const dateTo = toDateOrUndefined(query.dateTo);
  const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
  const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);

  const where: any = {};
  if (query.produitId) {
    where.commandes = {
      some: { lignesCommande: { some: { produitId: query.produitId } } }
    };
  }

  dateHelper(where, dateFrom, dateTo, "dateCreated");

  const whereTotal: any = {};
  if (denomFrom || denomTo) {
    dateHelper(whereTotal, denomFrom, denomTo, "dateCreated");
  }

  const [clientCountWindow, clientCountTotal] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.count({ where: { ...whereTotal } })
  ]);

  const percentage = clientCountTotal === 0 ? 0 : Number(((clientCountWindow / clientCountTotal) * 100).toFixed(2));

  return { statusCode: 200, data: { percentage, clientCountWindow, clientCountTotal } };
}

export async function RetoursParProduitParDate(
  query: StatistiquesRetourDto
): Promise<ServiceResponse<{ percentage: number; retourCountWindow: number; retourCountTotal: number }>> {
  const dateFrom = toDateOrUndefined(query.dateFrom);
  const dateTo = toDateOrUndefined(query.dateTo);
  const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
  const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);

  const whereRetourWindow: any = {};
  dateHelper(whereRetourWindow, dateFrom, dateTo, 'dateRetour');

  if (query.produitId) {
    whereRetourWindow.commande = { lignesCommande: { some: { produitId: query.produitId } } };
  }

  const whereRetourTotal: any = {};
  if (denomFrom || denomTo) {
    dateHelper(whereRetourTotal, denomFrom, denomTo, 'dateRetour');
  }

  const [retourCountWindow, retourCountTotal] = await Promise.all([
    prisma.retour.count({ where: whereRetourWindow }),
    prisma.retour.count({ where: whereRetourTotal }),
  ]);

  const percentage = retourCountTotal === 0 ? 0 : Number(((retourCountWindow / retourCountTotal) * 100).toFixed(2));
  return { statusCode: 200, data: { percentage, retourCountWindow, retourCountTotal } };
}


export async function RetoursParDateParProduit(
  query: StatistiquesRetourDto
): Promise<ServiceResponse<{ percentage: number; retourCountWindow: number; commandeCountTotal: number }>> {
  const dateFrom = toDateOrUndefined(query.dateFrom);
  const dateTo = toDateOrUndefined(query.dateTo);
  const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
  const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);

  const whereRetourWindow: any = {};
  dateHelper(whereRetourWindow, dateFrom, dateTo, 'dateRetour');

  if (query.produitId) {
    whereRetourWindow.commande = { lignesCommande: { some: { produitId: query.produitId } } };
  }

  const whereCommandeTotal: any = {};
  if (denomFrom || denomTo) {
    dateHelper(whereCommandeTotal, denomFrom, denomTo, 'dateCommande');
  }

  const [retourCountWindow, commandeCountTotal] = await Promise.all([
    prisma.retour.count({ where: whereRetourWindow }),
    prisma.commande.count({ where: whereCommandeTotal }),
  ]);

  const percentage = commandeCountTotal === 0 ? 0 : Number(((retourCountWindow / commandeCountTotal) * 100).toFixed(2));
  return { statusCode: 200, data: { percentage, retourCountWindow, commandeCountTotal } };
}