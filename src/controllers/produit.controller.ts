import { Request, Response } from "express";
import {
  createProduitService,
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
  const utilisateurId = req.user?.sub;

  if (req.body.fournisseurs && typeof req.body.fournisseurs === "string") {
    try {
      req.body.fournisseurs = JSON.parse(req.body.fournisseurs);
    } catch (err) {
      req.body.fournisseurs = req.body.fournisseurs
        .split(",")
        .map((i: string) => parseInt(i.trim(), 10));
    }
  }

  const dto = plainToInstance(CreateProduitDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const files = req.files as Express.Multer.File[];
    const imageNames = files.map((f) => f.filename);

    const produit = await createProduitService(
      dto,
      imageNames,
      req.body.fournisseurs,
      Number(utilisateurId)
    );
    return res.status(201).json({
      message: "Produit créé avec succès",
      produit: produit,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ message: err.message });
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
    const utilisateurId = req.user?.sub;
    let keepImages: string[] = [];

    const raw = req.body.keepImages;
    if (raw) {
      if (Array.isArray(raw)) {
        keepImages = raw.map((v) => String(v).trim()).filter(Boolean);
      } else if (typeof raw === "string") {
        try {
          keepImages = JSON.parse(raw);
          if (!Array.isArray(keepImages)) keepImages = [];
          keepImages = keepImages.map((v) => String(v).trim()).filter(Boolean);
        } catch {
          keepImages = raw
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean);
        }
      }
    }

    let fournisseurs: number[] | undefined;
    if (req.body.fournisseurs) {
      if (Array.isArray(req.body.fournisseurs)) {
        fournisseurs = req.body.fournisseurs.map((v: any) => Number(v));
      } else {
        fournisseurs = [Number(req.body.fournisseurs)];
      }
    }

    const updatedProduit = await updateProduit(
      id,
      { ...req.body, keepImages },
      (req.files as Express.Multer.File[]) || [],
      Number(utilisateurId)
    );

    if (!updatedProduit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    return res.json({
      message: "Produit mis à jour avec succès",
      produit: updatedProduit,
    });
  } catch (err: any) {
    console.error("[updateProduitController] error:", err);
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};
export const deleteProduitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const utilisateurId = req.user?.sub;
    const deleted = await deleteProduit(id, Number(utilisateurId));

    if (!deleted) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    return res.json({ message: "Produit supprimé avec succès" });
  } catch (error: any) {
    console.error("[deleteProduitController] error:", error);
    return res.status(500).json({ message: error.message });
  }
};
