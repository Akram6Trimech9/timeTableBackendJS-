const express = require('express');
const router = express.Router();
const {postMatiere,deleteMatiere,getMatiereById,getMatieres,updateMatiere } = require('../controller/matiereController');

router.post('/', postMatiere);
router.get('/', getMatieres);
router.get('/:id', getMatiereById);
router.put('/:id', updateMatiere);
router.delete('/:id', deleteMatiere);

module.exports = router;
