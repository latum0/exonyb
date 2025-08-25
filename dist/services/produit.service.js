"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduit = exports.updateProduit = exports.getProduitById = exports.getProduits = exports.HttpError = void 0;
exports.createProduitService = createProduitService;
const prisma_1 = __importDefault(require("../prisma"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class HttpError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.HttpError = HttpError;
async function createProduitService(data, images, fournisseurs = [], utilisateurId) {
    if (!images || images.length === 0) {
        throw new HttpError("Au moins une image est requise.", 400);
    }
    let fournisseurIds = [];
    if (fournisseurs) {
        fournisseurIds = Array.isArray(fournisseurs)
            ? fournisseurs
            : [fournisseurs];
    }
    if (fournisseurIds.length > 0) {
        const existing = await prisma_1.default.fournisseur.findMany({
            where: { idFournisseur: { in: fournisseurIds } },
            select: { idFournisseur: true },
        });
        const existingIds = existing.map((f) => f.idFournisseur);
        const invalidIds = fournisseurIds.filter((id) => !existingIds.includes(id));
        if (invalidIds.length > 0) {
            throw new HttpError(`Fournisseurs non trouvés: ${invalidIds.join(", ")}`, 404);
        }
    }
    const produitId = crypto_1.default.randomUUID();
    const productUrl = `http://localhost:3000/produits/${produitId}`;
    const produit = await prisma_1.default.produit.create({
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
    await prisma_1.default.historique.create({
        data: {
            dateModification: new Date(),
            descriptionAction: `Création du produit ${produit.nom}`,
            utilisateurId,
        },
    });
    return produit;
}
const getProduits = async (page, limit, filters) => {
    const skip = (page - 1) * limit;
    const where = {
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
    const produits = await prisma_1.default.produit.findMany({
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
    const total = await prisma_1.default.produit.count({ where });
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
exports.getProduits = getProduits;
const getProduitById = async (id) => {
    return prisma_1.default.produit.findUnique({
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
exports.getProduitById = getProduitById;
const updateProduit = async (id, data, files = [], utilisateurId) => {
    const produit = await prisma_1.default.produit.findUnique({ where: { idProduit: id } });
    if (!produit)
        return null;
    let keepImages = [];
    if (Array.isArray(data.keepImages)) {
        keepImages = data.keepImages
            .map((v) => String(v).trim())
            .filter(Boolean);
    }
    else if (typeof data.keepImages === "string") {
        try {
            const parsed = JSON.parse(data.keepImages);
            if (Array.isArray(parsed)) {
                keepImages = parsed.map((v) => String(v).trim()).filter(Boolean);
            }
            else {
                keepImages = data.keepImages
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean);
            }
        }
        catch {
            keepImages = data.keepImages
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
        }
    }
    const existingImages = Array.isArray(produit.images)
        ? produit.images.map(String)
        : [];
    const imagesToDelete = existingImages.filter((img) => !keepImages.includes(img));
    const uploadPath = path_1.default.join(process.cwd(), "uploads", "produits");
    for (const img of imagesToDelete) {
        try {
            const filePath = path_1.default.join(uploadPath, img);
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
        catch (err) {
            console.error("Failed to delete file", img, err);
        }
    }
    const newImages = (files || []).map((f) => f.filename);
    const finalImages = [...keepImages, ...newImages];
    let fournisseurIds = undefined;
    if (data.fournisseurs !== undefined) {
        if (Array.isArray(data.fournisseurs)) {
            fournisseurIds = data.fournisseurs
                .map((v) => Number(v))
                .filter((n) => !isNaN(n));
        }
        else if (typeof data.fournisseurs === "string") {
            const s = data.fournisseurs.trim();
            if (s.startsWith("[") && s.endsWith("]")) {
                try {
                    const parsed = JSON.parse(s);
                    if (Array.isArray(parsed))
                        fournisseurIds = parsed
                            .map((v) => Number(v))
                            .filter((n) => !isNaN(n));
                }
                catch {
                    fournisseurIds = s
                        .replace(/^\[|\]$/g, "")
                        .split(",")
                        .map((v) => Number(v.trim()))
                        .filter((n) => !isNaN(n));
                }
            }
            else {
                fournisseurIds = s
                    .split(",")
                    .map((v) => Number(v.trim()))
                    .filter((n) => !isNaN(n));
            }
        }
        else if (typeof data.fournisseurs === "number") {
            if (!isNaN(data.fournisseurs))
                fournisseurIds = [data.fournisseurs];
        }
    }
    let fournisseurConnect = undefined;
    if (fournisseurIds !== undefined) {
        if (fournisseurIds.length === 0) {
            fournisseurConnect = [];
        }
        else {
            const existing = await prisma_1.default.fournisseur.findMany({
                where: { idFournisseur: { in: fournisseurIds } },
                select: { idFournisseur: true },
            });
            const existingIds = existing.map((f) => f.idFournisseur);
            const invalidIds = fournisseurIds.filter((id) => !existingIds.includes(id));
            if (invalidIds.length > 0) {
                throw new HttpError(`Fournisseurs non trouvés: ${invalidIds.join(", ")}`, 404);
            }
            fournisseurConnect = fournisseurIds.map((id) => ({ idFournisseur: id }));
        }
    }
    else {
    }
    const updatedProduit = await prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.produit.update({
            where: { idProduit: id },
            data: {
                nom: data.nom ?? produit.nom,
                description: data.description ?? produit.description,
                prix: data.prix !== undefined ? Number(data.prix) : produit.prix,
                stock: data.stock !== undefined
                    ? parseInt(String(data.stock), 10)
                    : produit.stock,
                remise: data.remise !== undefined ? Number(data.remise) : produit.remise,
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
        return updated;
    });
    await prisma_1.default.historique.create({
        data: {
            dateModification: new Date(),
            descriptionAction: `Modification du produit ${produit.nom}`,
            utilisateurId,
        },
    });
    return updatedProduit;
};
exports.updateProduit = updateProduit;
const deleteProduit = async (id, utilisateurId) => {
    const produit = await prisma_1.default.produit.findUnique({
        where: { idProduit: id },
    });
    if (!produit) {
        return null;
    }
    const images = Array.isArray(produit.images)
        ? produit.images
            .map((img) => (typeof img === "string" ? img : ""))
            .filter((img) => !!img)
        : [];
    const uploadPath = path_1.default.join(process.cwd(), "uploads", "produits");
    images.forEach((img) => {
        const filePath = path_1.default.join(uploadPath, img);
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
            }
            catch (err) {
                console.error("Failed to delete file:", filePath, err);
            }
        }
    });
    await prisma_1.default.produit.delete({
        where: { idProduit: id },
    });
    await prisma_1.default.historique.create({
        data: {
            dateModification: new Date(),
            descriptionAction: `Suppression du produit ${produit.nom}`,
            utilisateurId,
        },
    });
    return produit;
};
exports.deleteProduit = deleteProduit;
