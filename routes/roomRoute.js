const express = require('express');
const router = express.Router();
const { postRoom, getRooms, getRoomById, updateRoom, deleteRoom } = require('../controller/roomController');

router.post('/', postRoom);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
