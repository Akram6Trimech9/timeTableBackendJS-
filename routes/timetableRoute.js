const express = require('express');
const router = express.Router();
const timeTableController = require('../controller/timeTableController');

router.post('/', timeTableController.postTimetable);
router.get('/:professorId', timeTableController.getTimetableByProfessor);
router.get('/:timetableId', timeTableController.getTimetableById); 
router.put('/:timetableId', timeTableController.updateTimetable);
router.delete('/:timetableId', timeTableController.deleteTimetable);
router.post('/check/:professorId', timeTableController.checkDateForThisProfessor);
router.post('/checkRoom/:roomId', timeTableController.checkRoomAvailability);
router.post('/check-group/:groupId', timeTableController.checkGroupAvailability);
router.get('/group/:groupId', timeTableController.groupTimeTable);

module.exports = router;
