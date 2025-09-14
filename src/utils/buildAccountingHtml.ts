export interface AccountingTotals {
    achatProduitsTotal: string;
    adsTotal: string;
    emballageTotal: string;
    abonnementTelTotal: string;
    autreTotal: string;
    salairesTotal: string;
    totalDate: string;
}

export function buildAccountingHtml(
    totals: AccountingTotals,
    dateFrom: string,
    dateTo: string,
    options?: { logoBase64?: string } // pass "data:imag
): string {
    const logoSrc = options?.logoBase64
        ? options.logoBase64.startsWith("data:")
            ? options.logoBase64
            : `data:image/png;base64,${options.logoBase64}`
        : "";

    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Rapport Comptable</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  /* (CSS is same modern style you approved; trimmed for brevity) */
  :root{ --accent-1:#eca374; --accent-2:#ff7a59; --bg:#f5f7fb; --card:#fff; --muted:#6b7280; --table-border:#e9f0f6; --text:#0f172a; --accent-gradient:linear-gradient(90deg,var(--accent-1),var(--accent-2)); --soft-shadow:0 8px 30px rgba(16,24,40,0.08); --radius:12px; --mono:"Inter","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; }
  html,body{height:100%;margin:0;background:var(--bg);font-family:var(--mono);color:var(--text);font-size:13px;-webkit-font-smoothing:antialiased;}
  .page{width:210mm;margin:12mm auto;padding:14px;box-sizing:border-box;}
  .card{background:var(--card);border-radius:var(--radius);box-shadow:var(--soft-shadow);padding:20px;position:relative;border:1px solid rgba(15,23,42,0.04);}
  .header{display:grid;grid-template-columns:72px 1fr auto;gap:16px;align-items:center;border-bottom:1px solid #eef5fb;padding-bottom:16px;}
  .logo-img{width:72px;height:72px;border-radius:10px;object-fit:contain;padding:8px;display:block;}
  .brand{display:flex;flex-direction:column;gap:2px;}
  .brand .name{font-weight:800;font-size:18px;background:var(--accent-gradient);-webkit-background-clip:text;background-clip:text;color:transparent;}
  .brand .tag{font-size:11px;color:var(--muted);}
  .title-block{text-align:center;}
  .title-block h1{margin:0;font-size:18px;color:var(--text);}
  .title-block .subtitle{margin-top:4px;font-size:11px;color:var(--muted);}
  .meta{text-align:right;font-size:12px;color:var(--muted);min-width:160px;}
  .report-meta{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:18px 0;}
  .report-meta .range{display:flex;gap:18px;align-items:center;color:var(--text);font-weight:700;font-size:13px;}
  table.report-table{width:100%;border-collapse:collapse;margin-top:4px;background:linear-gradient(180deg,#fff,#fcfdff);border-radius:8px;overflow:hidden;}
  table.report-table thead th{padding:14px 16px;font-size:12px;color:#0f172a;background:linear-gradient(90deg, rgba(236,163,116,0.10), rgba(255,122,89,0.06));border-bottom:1px solid var(--table-border);font-weight:800;}
  table.report-table tbody td{padding:12px 16px;border-bottom:1px solid #f3f8fc;font-size:13px;}
  .label{color:var(--text);font-weight:700;}
  .amount{text-align:right;font-variant-numeric:tabular-nums;font-weight:800;color:var(--text);}
  tr.total-row td{border-top:2px solid rgba(236,163,116,0.18);background:linear-gradient(90deg, rgba(236,163,116,0.04), rgba(255,122,89,0.02));font-size:15px;font-weight:900;}
  .footer{margin-top:18px;display:flex;justify-content:space-between;color:var(--muted);font-size:11px;}
  .watermark{position:absolute;right:18px;top:18px;opacity:0.05;font-size:64px;transform:rotate(-18deg);font-weight:900;color:var(--accent-1);}
  @media print{body{background:white}.page{margin:0}.card{box-shadow:none;border-radius:0;border:none}.watermark{display:none}}
</style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="header">
        ${logoSrc ? `<img class="logo-img" src="${logoSrc}" alt="Exony" />` : `<div style="width:72px;height:72px;border-radius:10px;background:linear-gradient(90deg,#f7f0eb,#fff3ec)"></div>`}
        <div>
          <div class="brand">
            <div class="name">Exony</div>
            <div class="tag">Comptabilité · Tableau de bord</div>
          </div>
        </div>
        <div class="meta">
          <div>Généré: <strong>${new Date().toLocaleString('fr-FR')}</strong></div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;">Rapport ID: <strong>#${Math.floor(Math.random() * 1000000)}</strong></div>
        </div>
      </div>

      <div class="report-meta" role="group" aria-label="Période du rapport">
        <div class="range">
          <div><small>Du</small><div style="font-weight:700;color:var(--text);">${dateFrom || "—"}</div></div>
          <div><small>Au</small><div style="font-weight:700;color:var(--text);">${dateTo || "—"}</div></div>
        </div>
        <div class="note">Récapitulatif net · Format PDF imprimable</div>
      </div>

      <table class="report-table" role="table" aria-label="Totaux comptables">
        <thead>
          <tr><th>Poste</th><th style="text-align:right">Montant (DZD)</th></tr>
        </thead>
        <tbody>
          <tr><td class="label">Achats de produits</td><td class="amount">${totals?.achatProduitsTotal ?? "0.00"}</td></tr>
          <tr><td class="label">Publicité</td><td class="amount">${totals?.adsTotal ?? "0.00"}</td></tr>
          <tr><td class="label">Emballage</td><td class="amount">${totals?.emballageTotal ?? "0.00"}</td></tr>
          <tr><td class="label">Abonnement téléphone</td><td class="amount">${totals?.abonnementTelTotal ?? "0.00"}</td></tr>
          <tr><td class="label">Salaires</td><td class="amount">${totals?.salairesTotal ?? "0.00"}</td></tr>
          <tr><td class="label">Autres</td><td class="amount">${totals?.autreTotal ?? "0.00"}</td></tr>
          <tr class="total-row"><td>Total</td><td class="amount">${totals?.totalDate ?? "0.00"}</td></tr>
        </tbody>
      </table>

      <div class="footer">
        <div class="note">Préparé par Exony · Confidentiel</div>
        <div class="note">Imprimé le ${new Date().toLocaleDateString('fr-FR')}</div>
      </div>

      <div class="watermark">EXONY</div>
    </div>
  </div>
</body>
</html>`;
}
