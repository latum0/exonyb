import { Request, Response } from "express";
import {
  createProduit,
  deleteProduit,
  getProduitById,
  getProduits,
  updateProduit,
} from "../services/produit.service";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateProduitDto } from "../dto/produit.dto";

export async function createProduitController(req: Request, res: Response) {
  req.body.prix = parseFloat(req.body.prix);
  req.body.stock = parseInt(req.body.stock, 10);
  req.body.remise = parseInt(req.body.remise, 10);

  const dto = plainToInstance(CreateProduitDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const files = req.files as Express.Multer.File[];
    const imageNames = files.map((f) => f.filename);

    const produit = await createProduit(dto, imageNames);
    return res.status(201).json(produit);
  } catch (err: any) {
    console.error("Error creating produit:", err);
    return res.status(500).json({ error: err.message || "Erreur serveur" });
  }
}

export const getAllProduitsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters = {
      nom: req.query.nom as string,
      marque: req.query.marque as string,
      categorie: req.query.categorie as string,
    };

    const result = await getProduits(page, limit, filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProduitByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const produit = await getProduitById(id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    res.json(produit);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let keepImages: string[] = [];

    const raw = req.body.keepImages;

    if (raw) {
      if (Array.isArray(raw)) {
        keepImages = raw.map((v) => String(v).trim()).filter(Boolean);
      } else if (typeof raw === "string") {
        const s = raw.trim();

        if (s.startsWith("[") && s.endsWith("]") && s.includes('"')) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
              keepImages = parsed.map((v) => String(v).trim()).filter(Boolean);
            } else {
              keepImages = s
                .replace(/^\[|\]$/g, "")
                .split(",")
                .map((v) => v.replace(/"/g, "").trim())
                .filter(Boolean);
            }
          } catch {
            keepImages = s
              .replace(/^\[|\]$/g, "")
              .split(",")
              .map((v) => v.replace(/"/g, "").trim())
              .filter(Boolean);
          }
        } else {
          keepImages = s
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        }
      } else {
        keepImages = [];
      }
    }

    const updatedProduit = await updateProduit(
      id,
      { ...req.body, keepImages },
      (req.files as Express.Multer.File[]) || []
    );

    if (!updatedProduit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    return res.json(updatedProduit);
  } catch (error: any) {
    console.error("[updateProduitController] error:", error);
    return res.status(500).json({ message: error.message || "Erreur interne" });
  }
};
export const deleteProduitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await deleteProduit(id);

    if (!deleted) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    return res.json({ message: "Produit supprimé avec succès" });
  } catch (error: any) {
    console.error("[deleteProduitController] error:", error);
    return res.status(500).json({ message: error.message });
  }
};
