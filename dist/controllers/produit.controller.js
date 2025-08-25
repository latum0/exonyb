"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduitController = exports.updateProduitController = exports.getProduitByIdController = exports.getAllProduitsController = void 0;
exports.createProduitController = createProduitController;
const produit_service_1 = require("../services/produit.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const produit_dto_1 = require("../dto/produit.dto");
async function createProduitController(req, res) {
    req.body.prix = parseFloat(req.body.prix);
    req.body.stock = parseInt(req.body.stock, 10);
    req.body.remise = parseInt(req.body.remise, 10);
    const utilisateurId = req.user?.sub;
    if (req.body.fournisseurs && typeof req.body.fournisseurs === "string") {
        try {
            req.body.fournisseurs = JSON.parse(req.body.fournisseurs);
        }
        catch (err) {
            req.body.fournisseurs = req.body.fournisseurs
                .split(",")
                .map((i) => parseInt(i.trim(), 10));
        }
    }
    const dto = (0, class_transformer_1.plainToInstance)(produit_dto_1.CreateProduitDto, req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    try {
        const files = req.files;
        const imageNames = files.map((f) => f.filename);
        const produit = await (0, produit_service_1.createProduitService)(dto, imageNames, req.body.fournisseurs, Number(utilisateurId));
        return res.status(201).json({
            message: "Produit créé avec succès",
            produit: produit,
        });
    }
    catch (err) {
        return res.status(err.statusCode || 500).json({ message: err.message });
    }
}
const getAllProduitsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            nom: req.query.nom,
            marque: req.query.marque,
            categorie: req.query.categorie,
        };
        const result = await (0, produit_service_1.getProduits)(page, limit, filters);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllProduitsController = getAllProduitsController;
const getProduitByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const produit = await (0, produit_service_1.getProduitById)(id);
        if (!produit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.json(produit);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProduitByIdController = getProduitByIdController;
const updateProduitController = async (req, res) => {
    try {
        const { id } = req.params;
        const utilisateurId = req.user?.sub;
        let keepImages = [];
        const raw = req.body.keepImages;
        if (raw) {
            if (Array.isArray(raw)) {
                keepImages = raw.map((v) => String(v).trim()).filter(Boolean);
            }
            else if (typeof raw === "string") {
                try {
                    keepImages = JSON.parse(raw);
                    if (!Array.isArray(keepImages))
                        keepImages = [];
                    keepImages = keepImages.map((v) => String(v).trim()).filter(Boolean);
                }
                catch {
                    keepImages = raw
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean);
                }
            }
        }
        let fournisseurs;
        if (req.body.fournisseurs) {
            if (Array.isArray(req.body.fournisseurs)) {
                fournisseurs = req.body.fournisseurs.map((v) => Number(v));
            }
            else {
                fournisseurs = [Number(req.body.fournisseurs)];
            }
        }
        const updatedProduit = await (0, produit_service_1.updateProduit)(id, { ...req.body, keepImages }, req.files || [], Number(utilisateurId));
        if (!updatedProduit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        return res.json({
            message: "Produit mis à jour avec succès",
            produit: updatedProduit,
        });
    }
    catch (err) {
        console.error("[updateProduitController] error:", err);
        return res.status(err.statusCode || 500).json({ message: err.message });
    }
};
exports.updateProduitController = updateProduitController;
const deleteProduitController = async (req, res) => {
    try {
        const { id } = req.params;
        const utilisateurId = req.user?.sub;
        const deleted = await (0, produit_service_1.deleteProduit)(id, Number(utilisateurId));
        if (!deleted) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        return res.json({ message: "Produit supprimé avec succès" });
    }
    catch (error) {
        console.error("[deleteProduitController] error:", error);
        return res.status(500).json({ message: error.message });
    }
};
exports.deleteProduitController = deleteProduitController;
