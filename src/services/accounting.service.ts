import { Decimal } from "@prisma/client/runtime/library";
import { AccountingTotals, CreateAccountingDto, GetAccountingQueryDto, UpdateAccountingDto } from "../dto/accounting.dto";
import { AccountingListResponseDto, AccountingResponseDto } from "../dto/response.dto";
import prisma from "../prisma";
import { ensureExists, stringToDecimal, stringToDecimalAccounting, stripNullish } from "../utils/helpers";
import { createHistoriqueService } from "./historique.service";
import { Prisma } from "@prisma/client";
import { IntervalDateDto } from "../dto/BaseFilter.dto";

function payloadAccounting(
    id: number,
    achatProduits: Decimal,
    ads: Decimal,
    emballage: Decimal,
    abonnementTel: Decimal,
    autre: Decimal,
    salaires: Decimal,
    total: Decimal,
    commentaire?: string | null,
) {
    const payload: AccountingResponseDto = {
        id,
        achatProduits: achatProduits.toString(),
        ads: ads.toString(),
        emballage: emballage.toString(),
        abonnementTel: abonnementTel.toString(),
        autre: autre.toString(),
        salaires: salaires.toString(),
        commentaire: commentaire,
        total: total.toString(),
    }

    return payload

}


export async function createAccounting(dto: CreateAccountingDto, utilisateurId: number): Promise<ServiceResponse<AccountingResponseDto>> {

    const { achatProduits, ads, emballage, abonnementTel, autre, salaires } = stringToDecimalAccounting(dto)

    const total = achatProduits
        .add(ads)
        .add(emballage)
        .add(abonnementTel)
        .add(autre)
        .add(salaires)

    const payloadCreate: CreateAccountingDto = {
        achatProduits: achatProduits.toString(),
        ads: ads.toString(),
        emballage: emballage.toString(),
        abonnementTel: abonnementTel.toString(),
        autre: autre.toString(),
        salaires: salaires.toString(),
        commentaire: dto.commentaire
    }

    const accounting = await prisma.$transaction(async (tx) => {
        const create = await tx.accounting.create({ data: { ...payloadCreate, total } })
        await createHistoriqueService(tx, utilisateurId, `creation de la ligne comptabilite ${create.id}`)
        return create;
    })


    const payload = payloadAccounting(
        accounting.id,
        accounting.achatProduits,
        accounting.ads,
        accounting.emballage,
        accounting.abonnementTel,
        accounting.autre,
        accounting.salaires,
        accounting.total,
        dto.commentaire
    )


    return { statusCode: 201, data: payload as AccountingResponseDto }


}
export async function updateAccounting(
    id: number,
    dto: UpdateAccountingDto,
    utilisateurId: number
): Promise<ServiceResponse<AccountingResponseDto>> {
    const oldrow = await ensureExists(
        () => prisma.accounting.findUnique({ where: { id } }),
        "Accounting"
    );

    const strp = stripNullish(dto);

    const abonnementTel = strp.abonnementTel ? stringToDecimal(strp.abonnementTel) : new Prisma.Decimal(oldrow.abonnementTel ?? "0");
    const achatProduits = strp.achatProduits ? stringToDecimal(strp.achatProduits) : new Prisma.Decimal(oldrow.achatProduits ?? "0");
    const ads = strp.ads ? stringToDecimal(strp.ads) : new Prisma.Decimal(oldrow.ads ?? "0");
    const autre = strp.autre ? stringToDecimal(strp.autre) : new Prisma.Decimal(oldrow.autre ?? "0");
    const emballage = strp.emballage ? stringToDecimal(strp.emballage) : new Prisma.Decimal(oldrow.emballage ?? "0");
    const salaires = strp.salaires ? stringToDecimal(strp.salaires) : new Prisma.Decimal(oldrow.salaires ?? "0");

    const total = abonnementTel
        .add(achatProduits)
        .add(ads)
        .add(autre)
        .add(emballage)
        .add(salaires);

    const accounting = await prisma.$transaction(async (tx) => {
        const updated = await tx.accounting.update({
            where: { id },
            data: {
                ...strp,
                total,
            },
        });

        await createHistoriqueService(tx, utilisateurId, `mis a jour de la ligne ${updated.id}`);
        return updated;
    });

    const payload = payloadAccounting(
        accounting.id,
        accounting.achatProduits,
        accounting.ads,
        accounting.emballage,
        accounting.abonnementTel,
        accounting.autre,
        accounting.salaires,
        accounting.total,
        accounting.commentaire
    );

    return { statusCode: 200, data: payload as AccountingResponseDto, message: "mis a jour success" };
}

export async function getAccountingById(id: number): Promise<ServiceResponse<AccountingResponseDto>> {
    const accounting = await ensureExists(() => prisma.accounting.findUnique({ where: { id } }), "Accounting")
    const payload = payloadAccounting(
        accounting.id,
        accounting.achatProduits,
        accounting.ads,
        accounting.emballage,
        accounting.abonnementTel,
        accounting.autre,
        accounting.salaires,
        accounting.total,
        accounting.commentaire
    )
    return { statusCode: 200, data: payload }

}

export async function getAllAccounting(q: GetAccountingQueryDto): Promise<ServiceResponse<AccountingListResponseDto>> {

    const parseNumber = (v: any): number | undefined => {
        if (v === undefined || v === null) return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    const page = Math.max(1, Math.floor(q.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(q.limit ?? 10)));

    const where: any = {}
    if (q.dateFrom || q.dateTo) {
        where.createdAt = {}
        if (q.dateFrom) where.createdAt.gte = new Date(q.dateFrom)
        if (q.dateTo) where.createdAt.lte = new Date(q.dateTo)
    }
    const idNum = parseNumber(q.id);
    if (typeof idNum === "number") where.id = idNum;

    const minTotalNum = parseNumber(q.minTotal);
    const maxTotalNum = parseNumber(q.maxTotal);
    if (minTotalNum !== undefined || maxTotalNum !== undefined) {
        where.total = {};
        if (minTotalNum !== undefined) where.total.gte = minTotalNum;
        if (maxTotalNum !== undefined) where.total.lte = maxTotalNum;
    }
    if (q.search) {
        where.commentaire = { contains: String(q.search).trim() };
    }
    const skip = (page - 1) * limit

    const [total, rows] = await prisma.$transaction([
        prisma.accounting.count({ where }),
        prisma.accounting.findMany({
            where,
            take: limit,
            skip,
            orderBy: { createdAt: "desc" },

        })
    ])

    const accountings: AccountingResponseDto[] = rows.map((c) => ({
        id: c.id,
        abonnementTel: c.abonnementTel.toString(),
        achatProduits: c.achatProduits.toString(),
        ads: c.ads.toString(),
        autre: c.autre.toString(),
        commentaire: c.commentaire,
        createdAt: c.createdAt.toString(),
        emballage: c.emballage.toString(),
        salaires: c.salaires.toString(),
        total: c.total.toString(),
    }))

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return { statusCode: 200, data: { accountings, totalPages, total, page, limit } }

}

export class AccountingGetResponse {
    totalData!: AccountingTotals;
    dateFrom!: string | null;
    dateTo!: string | null;

}



export async function getAccountingsByDate(
    date: IntervalDateDto
): Promise<ServiceResponse<AccountingGetResponse>> {
    const where: any = {};

    const payload: AccountingTotals = {
        achatProduitsTotal: "0.00",
        adsTotal: "0.00",
        emballageTotal: "0.00",
        abonnementTelTotal: "0.00",
        autreTotal: "0.00",
        salairesTotal: "0.00",
        totalDate: "0.00",
    };

    // Helper: convert incoming date-string to Date (start / end of day)
    const toStartOfDay = (d?: string): Date | undefined => {
        if (!d) return undefined;
        if (d.includes("T")) return new Date(d);
        return new Date(`${d}T00:00:00.000Z`);
    };
    const toEndOfDay = (d?: string): Date | undefined => {
        if (!d) return undefined;
        if (d.includes("T")) return new Date(d);
        return new Date(`${d}T23:59:59.999Z`);
    };

    const fmt = (v: any): string => {
        if (v === null || v === undefined) return "0.00";
        try {
            if (typeof v === "object" && typeof v.toFixed === "function") {
                return (v as any).toFixed(2);
            }
            const n = Number(v);
            if (Number.isNaN(n)) return String(v);
            return n.toFixed(2);
        } catch {
            return String(v);
        }
    };

    if (date?.dateFrom || date?.dateTo) {
        where.createdAt = {};
        const from = toStartOfDay(date?.dateFrom);
        const to = toEndOfDay(date?.dateTo);

        if (from) where.createdAt.gte = from;
        if (to) where.createdAt.lte = to;
    }

    const accountings = await prisma.accounting.aggregate({
        where,
        _sum: {
            achatProduits: true,
            ads: true,
            emballage: true,
            abonnementTel: true,
            autre: true,
            salaires: true,
            total: true,
        },
    });

    payload.achatProduitsTotal = fmt(accountings._sum.achatProduits);
    payload.adsTotal = fmt(accountings._sum.ads);
    payload.emballageTotal = fmt(accountings._sum.emballage);
    payload.abonnementTelTotal = fmt(accountings._sum.abonnementTel);
    payload.autreTotal = fmt(accountings._sum.autre);
    payload.salairesTotal = fmt(accountings._sum.salaires);
    payload.totalDate = fmt(accountings._sum.total);

    return {
        statusCode: 200,
        data: {
            totalData: payload,
            dateFrom: date.dateFrom ? String(date.dateFrom) : "",
            dateTo: date?.dateTo ? String(date.dateTo) : "",
        },
    };
}
