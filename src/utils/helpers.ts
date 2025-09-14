
import { Prisma } from "@prisma/client";
import { BadRequestError, ConflictError, NotFoundError } from "./errors";
import { AccountingResponseDto } from "../dto/response.dto";
import { Decimal } from "@prisma/client/runtime/library";


//used to check the existing of a value, otherwise return an error
export async function ensureExists<T>(find: () => Promise<T | null>, entity: string): Promise<T> {
    const check = await find();
    if (check === null) {
        throw new NotFoundError(`${entity}`);
    }
    return check;
}


//deleting null fields
export function stripNullish<T extends object>(dto: T): Partial<T> {

    return Object.fromEntries(
        Object.entries(dto).filter(([_, v]) => v != null)
    ) as Partial<T>;
}



export async function ensureUnique<T>(find: () => Promise<T | null>, entity: string): Promise<void> {
    const check = await find();
    if (check) {
        throw new ConflictError(`${entity} found`)
    }
}


export function parseRemiseToFraction(remise: number | null | undefined) {
    if (!remise || remise <= 0) return 0;
    if (remise <= 1) return remise;
    return remise / 100;
}

type Update =
    | { prixUnitaire: number; quantite?: number }
    | { prixUnitaire?: number; quantite: number };

export function newMontantTotal(
    oldQuantity: number,
    oldPrixUnitaire: number,
    oldMontantTotal: number,
    update: Update
): number {
    const newQuantity = update.quantite ?? oldQuantity;
    const newPrixUnit = update.prixUnitaire ?? oldPrixUnitaire;

    const produitTotal = newQuantity * newPrixUnit;
    const oldProduitTotal = oldQuantity * oldPrixUnitaire;

    const constantPart = oldMontantTotal - oldProduitTotal;

    return constantPart + produitTotal;
}


export function prixUnitaire(remise: number | undefined, prix: number | string | Prisma.Decimal): Prisma.Decimal {
    const remiseFraction = parseRemiseToFraction(remise ?? 0);

    if (remiseFraction < 0 || remiseFraction > 1) {
        throw new BadRequestError("Remise invalide");
    }

    const prixOrig =
        typeof prix === "number"
            ? new Prisma.Decimal(Number(prix).toFixed(2))
            : prix instanceof Prisma.Decimal
                ? prix
                : new Prisma.Decimal(prix as any);

    const prixAfterRemise = prixOrig.mul(new Prisma.Decimal(1).minus(new Prisma.Decimal(remiseFraction)));

    if (prixAfterRemise.isNegative()) {
        throw new BadRequestError("Prix négatif après remise");
    }

    return new Prisma.Decimal(prixAfterRemise.toFixed(2));
}


export function dateHelper(where: any, dateFrom?: any, dateTo?: any, dateField = 'dateCommande') {
    if (dateFrom || dateTo) {
        where[dateField] = {};
        if (dateFrom) where[dateField].gte = new Date(dateFrom);
        if (dateTo) where[dateField].lte = new Date(dateTo);
    }
    return where;
}

export function stringToDecimalAccounting(dto: any) {
    const achatProduits = new Prisma.Decimal(dto.achatProduits);
    const ads = new Prisma.Decimal(dto.ads);
    const emballage = new Prisma.Decimal(dto.emballage);
    const abonnementTel = new Prisma.Decimal(dto.abonnementTel);
    const autre = new Prisma.Decimal(dto.autre);
    const salaires = new Prisma.Decimal(dto.salaires);

    return { achatProduits, ads, emballage, abonnementTel, autre, salaires }
}


export function stringToDecimal(v: any) {
    const decimal = v ?? new Prisma.Decimal(v)
    return decimal
}

export function payloadAccounting(
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



export function htmlPdf(dateFrom: string, dateTo: string, achatProduitsTotal: string, adsTotal: string, emballageTotal: string, abonnementTelTotal: string, salairesTotal: string, autreTotal: string, totalDate: string) {

    const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Rapport Comptable</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    :root{
      --accent-1: #eca374; /* couleur du logo */
      --accent-2: #ff7a59; /* secondaire vive */
      --bg: #f5f7fb;
      --card: #ffffff;
      --muted: #6b7280;
      --table-border: #e9f0f6;
      --text: #0f172a;
      --accent-gradient: linear-gradient(90deg,var(--accent-1),var(--accent-2));
      --soft-shadow: 0 8px 30px rgba(16,24,40,0.08);
      --radius: 12px;
      --mono: "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    /* Base */
    html,body{
      height:100%;
      margin:0;
      background:var(--bg);
      font-family: var(--mono);
      color:var(--text);
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
      font-size:13px;
    }

    /* Page container sized for A4 when printed */
    .page {
      width:210mm;
      margin:12mm auto;
      padding:14px;
      box-sizing:border-box;
    }

    .card {
      background:var(--card);
      border-radius:var(--radius);
      box-shadow:var(--soft-shadow);
      padding:20px;
      overflow:hidden;
      position:relative;
      border:1px solid rgba(15,23,42,0.04);
    }

    /* Header layout using grid for consistent alignment */
    .header {
      display:grid;
      grid-template-columns:72px 1fr auto;
      gap:16px;
      align-items:center;
      border-bottom:1px solid #eef5fb;
      padding-bottom:16px;
    }

    .logo-img {
      width:72px;
      height:72px;
      border-radius:10px;
      display:block;
      object-fit:contain;
      background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      padding:8px;
      box-shadow:0 6px 18px rgba(14,165,163,0.06) inset;
    }

    .brand {
      display:flex;
      flex-direction:column;
      gap:2px;
    }
    .brand .name {
      font-weight:800;
      font-size:18px;
      letter-spacing:0.2px;
      background:var(--accent-gradient);
      -webkit-background-clip:text;
      background-clip:text;
      color:transparent;
    }
    .brand .tag {
      font-size:11px;
      color:var(--muted);
    }

    .title-block {
      text-align:center;
    }
    .title-block h1{
      margin:0;
      font-size:18px;
      letter-spacing:0.2px;
      color:var(--text);
    }
    .title-block .subtitle {
      margin-top:4px;
      font-size:11px;
      color:var(--muted);
    }

    .meta {
      text-align:right;
      font-size:12px;
      color:var(--muted);
      min-width:160px;
    }

    .report-meta {
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:center;
      margin:18px 0;
    }

    .report-meta .range {
      display:flex;
      gap:18px;
      align-items:center;
      color:var(--text);
      font-weight:700;
      font-size:13px;
    }
    .report-meta .range small {
      display:block;
      color:var(--muted);
      font-weight:500;
      font-size:11px;
    }

    /* Table */
    table.report-table{
      width:100%;
      border-collapse:collapse;
      margin-top:4px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.02);
      border-radius:8px;
      overflow:hidden;
      background: linear-gradient(180deg,#fff,#fcfdff);
    }

    table.report-table thead th{
      text-align:left;
      padding:14px 16px;
      font-size:12px;
      color:#0f172a;
      background: linear-gradient(90deg, rgba(236,163,116,0.10), rgba(255,122,89,0.06));
      border-bottom:1px solid var(--table-border);
      font-weight:800;
      letter-spacing:0.2px;
    }

    table.report-table tbody td{
      padding:12px 16px;
      border-bottom:1px solid #f3f8fc;
      vertical-align:middle;
      font-size:13px;
    }

    table.report-table tbody tr:nth-child(odd) td{
      background: rgba(250,250,252,1);
    }

    .label {
      color:var(--text);
      font-weight:700;
    }

    .amount {
      text-align:right;
      font-variant-numeric: tabular-nums;
      font-weight:800;
      color:var(--text);
    }

    tr.total-row td {
      border-top:2px solid rgba(236,163,116,0.18);
      background: linear-gradient(90deg, rgba(236,163,116,0.04), rgba(255,122,89,0.02));
      font-size:15px;
      font-weight:900;
    }

    /* Small notes and footer */
    .footer {
      margin-top:18px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      color:var(--muted);
      font-size:11px;
    }

    .watermark{
      position:absolute;
      right:18px;
      top:18px;
      opacity:0.05;
      font-size:64px;
      transform:rotate(-18deg);
      font-weight:900;
      pointer-events:none;
      color:var(--accent-1);
    }

    /* Responsive small tweaks (not critical for PDF but useful for preview) */
    @media (max-width:720px){
      .page{ width:auto; margin:12px; }
      .header{ grid-template-columns:56px 1fr; grid-auto-rows:auto; }
      .meta{ display:none; }
    }

    /* Print reset for clean paper output */
    @media print {
      body { background:white; }
      .page { margin:0; }
      .card { box-shadow:none; border-radius:0; border:none; }
      .watermark { display:none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="header">
        <!-- Option: replace src with your base64 data URI or external URL -->

        <div class="brand">
          <div class="name">Exony</div>
          <div class="tag">Comptabilité · Tableau de bord</div>
        </div>

        <div class="meta">
          <div>Généré: <strong>${new Date().toLocaleString('fr-FR')}</strong></div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;">Rapport ID: <strong>#${Math.floor(Math.random() * 1000000)}</strong></div>
        </div>
      </div>

      <div class="report-meta" role="group" aria-label="Période du rapport">
        <div class="range" aria-hidden="false">
          <div>
            <small>Du</small>
            <div style="font-weight:700;color:var(--text);">${dateFrom || "—"}</div>
          </div>
          <div>
            <small>Au</small>
            <div style="font-weight:700;color:var(--text);">${dateTo || "—"}</div>
          </div>
        </div>

        <div class="note">Récapitulatif net · Format PDF imprimable</div>
      </div>

      <table class="report-table" role="table" aria-label="Totaux comptables">
        <thead>
          <tr>
            <th>Poste</th>
            <th style="text-align:right">Montant (DZD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label">Achats de produits</td>
            <td class="amount">${achatProduitsTotal ?? "0.00"}</td>
          </tr>
          <tr>
            <td class="label">Publicité</td>
            <td class="amount">${adsTotal ?? "0.00"}</td>
          </tr>
          <tr>
            <td class="label">Emballage</td>
            <td class="amount">${emballageTotal ?? "0.00"}</td>
          </tr>
          <tr>
            <td class="label">Abonnement téléphone</td>
            <td class="amount">${abonnementTelTotal ?? "0.00"}</td>
          </tr>

          <!-- swapped: Salaires first, then Autres -->
          <tr>
            <td class="label">Salaires</td>
            <td class="amount">${salairesTotal ?? "0.00"}</td>
          </tr>
          <tr>
            <td class="label">Autres</td>
            <td class="amount">${autreTotal ?? "0.00"}</td>
          </tr>

          <tr class="total-row">
            <td>Total</td>
            <td class="amount">${totalDate ?? "0.00"}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div class="note">Imprimé le ${new Date().toLocaleDateString('fr-FR')}</div>
      </div>

      <div class="watermark">EXONY</div>
    </div>
  </div>
</body>
</html>
`

    return html;

}