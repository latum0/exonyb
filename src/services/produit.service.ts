import prisma from "../prisma";
import QRCode from "qrcode";
import { CreateProduitDto } from "../dto/produit.dto";
import crypto from "crypto";
import { Produit } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { restockNotification } from "./notification.service";
export class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function createProduitService(
  data: any,
  images: string[] | undefined,
  fournisseurs: number | number[] = [],
  utilisateurId: number
): Promise<Produit> {
  if (!images || images.length === 0) {
    throw new HttpError("Au moins une image est requise.", 400);
  }

  let fournisseurIds: number[] = [];
  if (fournisseurs) {
    fournisseurIds = Array.isArray(fournisseurs)
      ? fournisseurs
      : [fournisseurs];
  }

  if (fournisseurIds.length > 0) {
    const existing = await prisma.fournisseur.findMany({
      where: { idFournisseur: { in: fournisseurIds } },
      select: { idFournisseur: true },
    });
    const existingIds = existing.map((f) => f.idFournisseur);
    const invalidIds = fournisseurIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      throw new HttpError(
        `Fournisseurs non trouvés: ${invalidIds.join(", ")}`,
        404
      );
    }
  }

  const produitId = crypto.randomUUID();
  const productUrl = `http://localhost:3000/produits/${produitId}`;

  const produit = await prisma.produit.create({
    data: {
      idProduit: produitId,
      nom: data.nom,
      description: data.description,
      prix: data.prix,
      stock: data.stock,
      remise: data.remise ?? 0,
      marque: data.marque,
      images,
      categorie: data.categorie,
      qrCode: productUrl,
      fournisseurs: {
        connect: fournisseurIds.map((id) => ({ idFournisseur: id })),
      },
    },
  });
  await prisma.historique.create({
    data: {
      dateModification: new Date(),
      descriptionAction: `Création du produit ${produit.nom}`,

      utilisateurId,
    },
  });

  return produit;
}

export const getProduits = async (
  page: number,
  limit: number,
  filters: { nom?: string; marque?: string; categorie?: string }
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    ...(filters.nom && {
      nom: { contains: filters.nom.toLowerCase() },
    }),
    ...(filters.marque && {
      marque: { contains: filters.marque.toLowerCase() },
    }),
    ...(filters.categorie && {
      categorie: { contains: filters.categorie.toLowerCase() },
    }),
  };

  const produits = await prisma.produit.findMany({
    skip,
    take: limit,
    where,
    select: {
      idProduit: true,
      nom: true,
      prix: true,
      stock: true,
      remise: true,
      marque: true,
      categorie: true,
      qrCode: true,
      images: true, // on sélectionne les images
    },
    orderBy: { createdAt: "desc" },
  });

  // transformer pour ne garder que la première image
  const data = produits.map((p) => ({
    ...p,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
  }));

  const total = await prisma.produit.count({ where });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProduitById = async (id: string) => {
  return prisma.produit.findUnique({
    where: { idProduit: id },
    include: {
      fournisseurs: {
        select: {
          idFournisseur: true,
          nom: true,
        },
      },
    },
  });
};
export const updateProduit = async (
  id: string,
  data: any,
  files: Express.Multer.File[] = [],
  utilisateurId: number
) => {
  const produit = await prisma.produit.findUnique({ where: { idProduit: id } });
  if (!produit) return null;

  let keepImages: string[] = [];
  if (Array.isArray(data.keepImages)) {
    keepImages = data.keepImages
      .map((v: any) => String(v).trim())
      .filter(Boolean);
  } else if (typeof data.keepImages === "string") {
    try {
      const parsed = JSON.parse(data.keepImages);
      if (Array.isArray(parsed)) {
        keepImages = parsed.map((v: any) => String(v).trim()).filter(Boolean);
      } else {
        keepImages = data.keepImages
          .split(",")
          .map((v: string) => v.trim())
          .filter(Boolean);
      }
    } catch {
      keepImages = data.keepImages
        .split(",")
        .map((v: string) => v.trim())
        .filter(Boolean);
    }
  }

  const existingImages: string[] = Array.isArray(produit.images)
    ? produit.images.map(String)
    : [];
  const imagesToDelete = existingImages.filter(
    (img) => !keepImages.includes(img)
  );
  const uploadPath = path.join(process.cwd(), "uploads", "produits");
  for (const img of imagesToDelete) {
    try {
      const filePath = path.join(uploadPath, img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete file", img, err);
    }
  }
  const newImages = (files || []).map((f) => f.filename);
  const finalImages = [...keepImages, ...newImages];

  let fournisseurIds: number[] | undefined = undefined;
  if (data.fournisseurs !== undefined) {
    if (Array.isArray(data.fournisseurs)) {
      fournisseurIds = data.fournisseurs
        .map((v: any) => Number(v))
        .filter((n: number) => !isNaN(n));
    } else if (typeof data.fournisseurs === "string") {
      const s = data.fournisseurs.trim();
      if (s.startsWith("[") && s.endsWith("]")) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed))
            fournisseurIds = parsed
              .map((v) => Number(v))
              .filter((n) => !isNaN(n));
        } catch {
          fournisseurIds = s
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map((v: string) => Number(v.trim()))
            .filter((n: number) => !isNaN(n));
        }
      } else {
        fournisseurIds = s
          .split(",")
          .map((v: string) => Number(v.trim()))
          .filter((n: number) => !isNaN(n));
      }
    } else if (typeof data.fournisseurs === "number") {
      if (!isNaN(data.fournisseurs)) fournisseurIds = [data.fournisseurs];
    }
  }

  let fournisseurConnect: { idFournisseur: number }[] | undefined = undefined;

  if (fournisseurIds !== undefined) {
    if (fournisseurIds.length === 0) {
      fournisseurConnect = [];
    } else {
      const existing = await prisma.fournisseur.findMany({
        where: { idFournisseur: { in: fournisseurIds } },
        select: { idFournisseur: true },
      });
      const existingIds = existing.map((f) => f.idFournisseur);

      const invalidIds = fournisseurIds.filter(
        (id) => !existingIds.includes(id)
      );
      if (invalidIds.length > 0) {
        throw new HttpError(
          `Fournisseurs non trouvés: ${invalidIds.join(", ")}`,
          404
        );
      }
      fournisseurConnect = fournisseurIds.map((id) => ({ idFournisseur: id }));
    }
  } else {
  }

  const updatedProduit = await prisma.$transaction(async (tx) => {
    const prevProduit = await tx.produit.findUnique({ where: { idProduit: id }, select: { stock: true } });

    const updated = await tx.produit.update({
      where: { idProduit: id },
      data: {
        nom: data.nom ?? produit.nom,
        description: data.description ?? produit.description,
        prix: data.prix !== undefined ? Number(data.prix) : produit.prix,
        stock:
          data.stock !== undefined
            ? parseInt(String(data.stock), 10)
            : produit.stock,
        remise:
          data.remise !== undefined ? Number(data.remise) : produit.remise,
        marque: data.marque ?? produit.marque,
        categorie: data.categorie ?? produit.categorie,
        images: finalImages,
        ...(fournisseurIds !== undefined
          ? { fournisseurs: { set: fournisseurConnect } }
          : {}),
      },
      include: {
        fournisseurs: true,
      },
    });
    if (data.stock !== undefined) {
      const prevStock = prevProduit?.stock ?? produit.stock;
      const newStock = updated.stock;
      if (prevStock === 0 && newStock > 0) {
        try {
          await restockNotification(tx, [id]);
        } catch (err) {
          console.error("Failed to resolve restock notifications for produit", id, err);
        }
      }
    }


    return updated;
  });
  await prisma.historique.create({
    data: {
      dateModification: new Date(),
      descriptionAction: `Modification du produit ${produit.nom}`,

      utilisateurId,
    },
  });
  return updatedProduit;
};

export const deleteProduit = async (id: string, utilisateurId: number) => {
  const produit = await prisma.produit.findUnique({
    where: { idProduit: id },
  });

  if (!produit) {
    return null;
  }

  const images: string[] = Array.isArray(produit.images)
    ? (produit.images as any[])
      .map((img) => (typeof img === "string" ? img : ""))
      .filter((img) => !!img)
    : [];
  const uploadPath = path.join(process.cwd(), "uploads", "produits");

  images.forEach((img) => {
    const filePath = path.join(uploadPath, img);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete file:", filePath, err);
      }
    }
  });

  await prisma.produit.delete({
    where: { idProduit: id },
  });
  await prisma.historique.create({
    data: {
      dateModification: new Date(),
      descriptionAction: `Suppression du produit ${produit.nom}`,

      utilisateurId,
    },
  });
  return produit;
};