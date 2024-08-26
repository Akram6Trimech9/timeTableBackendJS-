const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); 
const TeacherController = require('../controller/TeacherController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.get('/search', TeacherController.searchTeacher);
router.post('/:idDepartement', upload.single('photo'), TeacherController.postTeacher);
router.get('/',authMiddleware,isAdmin, TeacherController.getAllTeacher);
router.get('/all',authMiddleware,isAdmin, TeacherController.getAll);
router.get('/:id',authMiddleware,isAdmin ,TeacherController.getTeacherById);
router.patch('/:id',authMiddleware,isAdmin, upload.single('photo') ,TeacherController.updateTeacher);
router.delete('/:id',authMiddleware,isAdmin, TeacherController.deleteTeacher);
 
module.exports = router;
