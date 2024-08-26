const Teacher = require('../models/teacher');
const Departement = require('../models/departement');
 const asyncHandler = require('express-async-handler');
  require("dotenv").config();
 
const postTeacher = asyncHandler(async (req, res) => {
   const { firstName, mobile, lastName, email,grade } = req.body;
   console.log(req.body)
    const {idDepartement} =req.params
    console.log(idDepartement,"idDepartement")

   try {
       const existingTeacher = await Teacher.findOne({ email });
       if (existingTeacher) {
           return res.status(400).json({ success: false, message: "Teacher with this email already exists" });
       }
       const newTeacher = new Teacher({
           firstName,
            mobile,
           lastName,
           email,
            grade,
           photo: process.env.URLBACKEND + (req.file ? req.file.path : null)  ,
           departement:idDepartement
       }); 
        const savedTeacher =  await newTeacher.save() ;

        const updateDepartement = await  Departement.findByIdAndUpdate(idDepartement,{$push:{teachers:savedTeacher }}).populate('teachers')
         res.status(201).json({ success: true, data: savedTeacher });  
   } catch (error) {
       res.status(500).json({ success: false, message: error.message });
   }
});

const getAllTeacher = asyncHandler(async (req, res) => {
   const page = parseInt(req.query.page) || 1;
   const pageSize = parseInt(req.query.pageSize) || 10;
   const skip = (page - 1) * pageSize;
 
   try {
     const totalItems = await Teacher.countDocuments();
     const Teachers = await Teacher.find().populate("departement").skip(skip).limit(pageSize);
     res.status(200).json({ success: true, data: Teachers, totalItems });
   } catch (error) {
     res.status(500).json({ success: false, message: error.message });
   }
 });
 
 const getAll = asyncHandler(async (req, res) => {
    try {
       const Teachers = await Teacher.find() 
      res.status(200).json({ success: true, data: Teachers});
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
const deleteTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;
   try {
      const teacher = await Teacher.findByIdAndDelete(id);
       if (!teacher) {
          return res.status(404).json({ success: false, message: "Teacher not found" });
      }
      res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

const getTeacherById = asyncHandler(async (req, res) => {
   const id = req.params.id;
   try {
       const Teacher = await Teacher.findById(id);
       if (!Teacher) {
           return res.status(404).json({ success: false, message: "Teacher not found" });
       }
       res.status(200).json({ success: true, data: Teacher });
   } catch (error) {
       res.status(500).json({ success: false, message: error.message });
   }
});
const updateTeacher = asyncHandler(async (req, res) => {
   const id = req.params.id;
   try {
       let updatedData = { ...req.body };
        if (req.file) {
           updatedData.photo = process.env.URLBACKEND + req.file.path;
       }
       const teacher = await Teacher.findByIdAndUpdate(id, updatedData, { new: true });
       if (!teacher) {
           return res.status(404).json({ success: false, message: "Teacher not found" });
       }
       res.status(200).json({ success: true, data: teacher });
   } catch (error) {
       res.status(500).json({ success: false, message: error.message });
   }
});


const searchTeacher = asyncHandler(async (req, res) => {

   const query = req.query.query;
    const searchCriteria = {};

   if (query) {
       searchCriteria.$or = [
           { firstName: { $regex: query, $options: 'i' } },
           { lastName: { $regex: query, $options: 'i' } },
           { cin: { $regex: query, $options: 'i' } },
           { mobile: { $regex: query, $options: 'i' } },
           { email: { $regex: query, $options: 'i' } },
        ];
   }

   try {
       const teacher = await Teacher.find(searchCriteria);
       res.status(200).json({ success: true, data: teacher });
   } catch (error) {
       console.error('Error during search:', error);
       res.status(500).json({ success: false, message: error.message });
   }
});

 
module.exports = {getAll,postTeacher ,deleteTeacher, getAllTeacher,getTeacherById,updateTeacher,searchTeacher };
