import prisma from "../prisma";
import QRCode from "qrcode";
import { CreateProduitDto } from "../dto/produit.dto";
import crypto from "crypto";
import { Produit } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
export async function createProduit(
  dto: CreateProduitDto,
  images: string[]
): Promise<Produit> {
  if (!images || images.length === 0) {
    throw new Error("Au moins une image est requise.");
  }

  const produitId = crypto.randomUUID();

  const productUrl = `http://localhost:3000/produits/${produitId}`;
  const qrCode = await QRCode.toDataURL(productUrl);
  const produit = await prisma.produit.create({
    data: {
      idProduit: produitId,
      nom: dto.nom,
      description: dto.description,
      prix: dto.prix,
      stock: dto.stock,
      remise: dto.remise ?? 0,
      marque: dto.marque,
      images,
      categorie: dto.categorie,
      qrCode,
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

  const data = await prisma.produit.findMany({
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
    },
  });

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
      fournisseurs: true,
    },
  });
};
export const updateProduit = async (
  id: string,
  data: any,
  files: Express.Multer.File[] = []
) => {
  const produit = await prisma.produit.findUnique({
    where: { idProduit: id },
  });

  if (!produit) {
    return null;
  }

  let keepImages: string[] = [];
  if (Array.isArray(data.keepImages)) {
    keepImages = data.keepImages
      .map((v: any) => String(v).trim())
      .filter(Boolean);
  } else if (typeof data.keepImages === "string") {
    const raw = data.keepImages.trim();
    if (raw.startsWith("[") && raw.endsWith("]") && raw.includes('"')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          keepImages = parsed.map((v: any) => String(v).trim()).filter(Boolean);
        } else {
          keepImages = raw
            .replace(/^\[|\]$/g, "")
            .split(",")

            .map((s: string) => s.replace(/"/g, "").trim())
            .filter(Boolean);
        }
      } catch {
        keepImages = raw
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((s: string) => s.replace(/"/g, "").trim())
          .filter(Boolean);
      }
    } else {
      keepImages = raw
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  } else {
    keepImages = [];
  }
  //@ts-ignore
  const existingImages: string[] = Array.isArray(produit.images)
    ? produit.images
    : [];

  const imagesToDelete = existingImages.filter(
    (img) => !keepImages.includes(img)
  );

  const uploadPath = path.join(process.cwd(), "uploads", "produits");

  for (const img of imagesToDelete) {
    try {
      const filePath = path.join(uploadPath, img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
      }
    } catch (err) {
      console.error("Failed to delete file", img, err);
    }
  }

  const newImages = (files || []).map((f) => f.filename);

  const finalImages = [...keepImages, ...newImages];

  const updatedProduit = await prisma.produit.update({
    where: { idProduit: id },
    data: {
      nom: data.nom ?? produit.nom,
      description: data.description ?? produit.description,
      prix:
        data.prix !== undefined
          ? isNaN(Number(data.prix))
            ? produit.prix
            : Number(data.prix)
          : produit.prix,
      stock:
        data.stock !== undefined
          ? isNaN(Number(data.stock))
            ? produit.stock
            : parseInt(String(data.stock), 10)
          : produit.stock,
      remise:
        data.remise !== undefined
          ? isNaN(Number(data.remise))
            ? produit.remise
            : Number(data.remise)
          : produit.remise,
      marque: data.marque ?? produit.marque,
      categorie: data.categorie ?? produit.categorie,
      images: finalImages,
    },
  });

  return updatedProduit;
};
export const deleteProduit = async (id: string) => {
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

  return produit;
};
