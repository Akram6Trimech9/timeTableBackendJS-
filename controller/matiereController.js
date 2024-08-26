const Matiere = require('../models/matiere');
const Departement = require('../models/departement');
const asyncHandler = require('express-async-handler');

 const postMatiere = asyncHandler(async (req, res) => {
    const { matiereName, DepartementId } = req.body;
    try {
        const existingMatiere = await Matiere.findOne({ matiereName: matiereName });
        if (existingMatiere) {
            return res.status(400).json({ success: false, message: "Matiere with this name already exists" });
        }
        const newMatiere = new Matiere({
            matiereName,
             departement: DepartementId
        });
        const savedMatiere = await newMatiere.save();

        if (savedMatiere && DepartementId) {
            await Departement.findByIdAndUpdate(
                DepartementId,
                { $push: { matieres: savedMatiere._id } },
                { new: true }
            );
        }
        res.status(201).json({ success: true, data: savedMatiere });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const getMatieres = asyncHandler(async (req, res) => {
    try {
        const Matieres = await Matiere.find().populate('departement');
        res.status(200).json({ success: true, data: Matieres });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const getMatiereById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const matiere = await Matiere.findById(id).populate('departement');
        if (!matiere) {
            return res.status(404).json({ success: false, message: "Matiere not found" });
        }
        res.status(200).json({ success: true, data: matiere });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const updateMatiere = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { matiereName,   DepartementId } = req.body;

    try {
        const updatedMatiere = await Matiere.findByIdAndUpdate(
            id,
            { matiereName, departement: DepartementId },
            { new: true }
        );

        if (!updatedMatiere) {
            return res.status(404).json({ success: false, message: "Matiere not found" });
        }

        if (DepartementId) {
            await Departement.findByIdAndUpdate(
                DepartementId,
                { $addToSet: { matieres: updatedMatiere._id } }
            );
        }

        res.status(200).json({ success: true, data: updatedMatiere });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const deleteMatiere = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedMatiere = await Matiere.findByIdAndDelete(id);

        if (!deletedMatiere) {
            return res.status(404).json({ success: false, message: "Matiere not found" });
        }

        if (deletedMatiere.departement) {
            await Departement.findByIdAndUpdate(
                deletedMatiere.departement,
                { $pull: { Matieres: deletedMatiere._id } }
            );
        }

        res.status(200).json({ success: true, message: "Matiere deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 module.exports = {
    postMatiere,
    getMatieres,
    getMatiereById,
    updateMatiere,
    deleteMatiere
};
