   const Departement = require('../models/departement');
 const asyncHandler = require('express-async-handler');
 require("dotenv").config();

 const postDepartement = asyncHandler(async (req, res) => {
    const { name} = req.body;
    try {
        const existingDepartement= await Departement.findOne({ name });
        if (existingDepartement) {
            return res.status(400).json({ success: false, message: "Departement with this name already exists" });
        }
        const newDepartmenet = new Departement({
            name,
            photo:   (req.file ? process.env.URLBACKEND+req.file.path : null)  
        }); 
         const savedDepartement = await newDepartmenet.save();
        res.status(201).json({ success: true, data: savedDepartement });  
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const getAll = asyncHandler(async (req, res) => {
    try {
      const departement = await Departement.find();
      res.status(200).json({ success: true, data: departement  });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  const getAllDepartements = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
  
    try {
      const totalItems = await Departement.countDocuments();
      const departements = await Departement.find().skip(skip).limit(pageSize);
      res.status(200).json({ success: true, data: departements, totalItems });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

  const getDepartementById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
        const departement = await Departement.findById(id).populate('teachers');
         if (!departement) {
            return res.status(404).json({ success: false, message: "Departement not found" });
        }
        res.status(200).json({ success: true, data: departement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const updateDepartement = asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
        let updatedData = { ...req.body };
         if (req.file) {
            updatedData.photo = process.env.URLBACKEND + req.file.path;
        }
        const departement = await Departement.findByIdAndUpdate(id, updatedData, { new: true });
        if (!departement) {
            return res.status(404).json({ success: false, message: "departement not found" });
        }
        res.status(200).json({ success: true, data: departement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


const deleteDepartement = asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
        const departement = await Departement.findByIdAndDelete(id);
        if (!departement) {
            return res.status(404).json({ success: false, message: "departement not found" });
        }
        res.status(200).json({ success: true, message: "departement deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
const searchDepartement = asyncHandler(async (req, res) => {
 
    const query = req.query.query;
     const searchCriteria = {};

    if (query) {
        searchCriteria.$or = [
            { name: { $regex: query, $options: 'i' } }
        ];
    }

    try {
        const departement = await Departement.find(searchCriteria);
        res.status(200).json({ success: true, data: departement });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = {getAll,searchDepartement,postDepartement, deleteDepartement,updateDepartement , getDepartementById ,getAllDepartements};
