const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); 
const DepartementController = require('../controller/departementController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
router.get('/allDepartement', DepartementController.getAll);
router.get('/search', DepartementController.searchDepartement);
router.post('/', upload.single('photo'), DepartementController.postDepartement);
router.get('/',authMiddleware,isAdmin, DepartementController.getAllDepartements);
router.get('/:id',authMiddleware,isAdmin ,DepartementController.getDepartementById);
router.patch('/:id',authMiddleware,isAdmin, upload.single('photo') ,DepartementController.updateDepartement);
router.delete('/:id',authMiddleware,isAdmin, DepartementController.deleteDepartement);

module.exports = router;
