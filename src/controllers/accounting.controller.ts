import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../utils/errors";
import { CreateAccountingDto, UpdateAccountingDto } from "../dto/accounting.dto";
import { createAccounting, getAccountingById, getAccountingsByDate, getAllAccounting, updateAccounting } from "../services/accounting.service";
import * as puppeteer from "puppeteer"
import { htmlPdf } from "../utils/helpers";

export async function createAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req.user as { sub: number }).sub;
  const dto = req.body as CreateAccountingDto;

  const { statusCode, data } = await createAccounting(dto, userId)
  res.status(statusCode).json(data)

}

export async function updateAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = (req.user as { sub: number }).sub;
  const dto = req.body as UpdateAccountingDto;
  const idAccounting = Number(req.params.id);
  if (isNaN(idAccounting)) {
    throw new BadRequestError("idAccounting should be a number")
  }
  const { statusCode, data } = await updateAccounting(idAccounting, dto, userId)
  res.status(statusCode).json(data)
}

export async function getByIdAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idAccounting = Number(req.params.id);
  if (isNaN(idAccounting)) {
    res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
    return;
  } const { statusCode, data } = await getAccountingById(idAccounting)
  res.status(statusCode).json(data)

}

export async function getAllAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {

  const query = (req as any).validatedQuery ?? req.query;
  const { statusCode, data } = await getAllAccounting(query)
  res.status(statusCode).json(data)

}


export async function getAccountingsBydatePuppeteerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let browser: puppeteer.Browser | null = null;

  const dateDto = req.body;
  const { data } = await getAccountingsByDate(dateDto);
  const totals = data?.totalData;
  const dateFrom = data?.dateFrom ?? "";
  const dateTo = data?.dateTo ?? "";

  if (!totals) {
    return next(new BadRequestError("Aucune donnée comptable disponible pour la plage de dates indiquée."))
  }


  const html = htmlPdf(
    dateFrom,
    dateTo,
    totals.achatProduitsTotal ?? "0.00",
    totals.adsTotal ?? "0.00",
    totals.emballageTotal ?? "0.00",
    totals.abonnementTelTotal ?? "0.00",
    totals.salairesTotal ?? "0.00",
    totals.autreTotal ?? "0.00",
    totals.totalDate ?? "0.00"
  );
  browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "12mm", right: "12mm" },
  });

  await page.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="accounting_${dateFrom || "all"}_${dateTo || "now"}.pdf"`
  );
  res.send(pdfBuffer);

}
