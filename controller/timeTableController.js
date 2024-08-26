const Group = require('../models/groups');
const Timetable = require('../models/timetable');
const Teacher = require('../models/teacher');
const DateEmploi=require('../models/EmploisDates')
 const asyncHandler = require('express-async-handler');

  

 const postTimetable = asyncHandler(async (req, res) => {
  const { professorId, sessions, emploiDateId, timeSlots } = req.body;

  try {
    const newTimetable = new Timetable({ professorId, sessions, emploiDateId, timeSlots });
    const savedTimetable = await newTimetable.save();

    if (savedTimetable) {
      await Teacher.findByIdAndUpdate(professorId, { $push: { timeTables: savedTimetable._id } });

      for (const session of sessions) {
        const { group } = session;

        const existingGroup = await Group.findById(group);

        if (existingGroup) {
          const existingTimeTableEntry = existingGroup.timeTable.find(
            entry => entry.emploiDateId.equals(emploiDateId)
          );

          if (existingTimeTableEntry) {
            await Group.findByIdAndUpdate(group, {
              $push: { "timeTable.$[entry].sessions": { ...session, professorId: professorId } }
            }, {
              arrayFilters: [{ "entry.emploiDateId": emploiDateId }],
              new: true
            });
          } else {
            // Add a new timeTable entry
            await Group.findByIdAndUpdate(group, {
              $push: { timeTable: { emploiDateId, sessions: [{ ...session, professorId: professorId }], timeSlots } }
            });
          }
        }
      }

      res.status(201).json({ success: true, data: savedTimetable });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



const getTimetableByProfessor = asyncHandler(async (req, res) => {
  const professorId = req.params.professorId;
  try {
    const timetables = await Timetable.find({ professorId })
      .populate('emploiDateId')   
      .populate('sessions.matiere')   
      .populate('sessions.room')      
      .populate('sessions.group');   

    if (!timetables) {
      return res.status(404).json({ success: false, message: "Timetable not found" });
    }
    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


 const updateTimetable = asyncHandler(async (req, res) => {
  const { timetableId } = req.params;
  const { sessions, emploiDateId, timeSlots } = req.body;
  try {
    const updatedTimetable = await Timetable.findByIdAndUpdate(
      timetableId,
      { sessions, emploiDateId, timeSlots },
      { new: true }
    );
    if (!updatedTimetable) {
      return res.status(404).json({ success: false, message: "Timetable not found" });
    }
    res.status(200).json({ success: true, data: updatedTimetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const getTimetableById = asyncHandler(async (req, res) => {
  const { timetableId } = req.params;
  try {
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ success: false, message: "Timetable not found" });
    }
    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const deleteTimetable = asyncHandler(async (req, res) => {
  const { timetableId } = req.params;
  try {
    // Find the timetable to delete
    const deletedTimetable = await Timetable.findById(timetableId);
    if (!deletedTimetable) {
      return res.status(404).json({ success: false, message: "Timetable not found" });
    }

     await Teacher.findByIdAndUpdate(deletedTimetable.professorId, { $pull: { timeTables: timetableId } });

     for (const session of deletedTimetable.sessions) {
      await Group.findByIdAndUpdate(session.group, {
        $pull: { timeTable: { emploiDateId: deletedTimetable.emploiDateId } }  
      });

       await Group.updateOne(
        { _id: session.group, "timeTable.emploiDateId": deletedTimetable.emploiDateId },
        { $pull: { "timeTable.$.sessions": { _id: session._id } } }  
      );
    }

     await Timetable.findByIdAndDelete(timetableId);

    res.status(200).json({ success: true, message: "Timetable and associated group references deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


 const checkDateForThisProfessor = asyncHandler(async (req, res) => {
  const { emploiDateId } = req.body;
  const { professorId } = req.params;
    try {
    const emploiDate = await DateEmploi.findById(emploiDateId); 
    console.log(emploiDateId)

    if (!emploiDate) {
      return res.status(400).json({ success: false, message: "Emploi date not found" });
    }

    const existingTimetables = await Timetable.find({
      professorId: professorId,
      emploiDateId: emploiDate._id,
    });

    if (existingTimetables.length > 0) {
      return res.status(200).json({
        success: false,
        message: "A timetable already exists for the specified period.",
        data: false,
      });
    }

    res.status(200).json({ success: true, message: "No timetable conflict. You can create a new timetable.", data: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
const checkRoomAvailability = asyncHandler(async (req, res) => {
  const { emploiDateId, sessions } = req.body;
  const { roomId } = req.params;

  try {
    const emploiDate = await DateEmploi.findById(emploiDateId);
    if (!emploiDate) {
      return res.status(400).json({ success: false, message: "Emploi date not found" });
    }

    // Find all timetables that include the room and match the emploiDateId
    const existingTimetables = await Timetable.find({
      "sessions.room": roomId,
      emploiDateId: emploiDate._id,
    }).populate('sessions');

    console.log('Existing Timetables:', existingTimetables);

    const { day, start, end } = sessions;

    for (const timetable of existingTimetables) {
      for (const existingSession of timetable.sessions) {
        const { day: existingDay, start: existingStart, end: existingEnd } = existingSession;
        console.log(start,existingEnd,existingStart,end)

        if (
          existingDay === day &&
          !(
            (start >= existingEnd) ||    
            (end <= existingStart)       
          )
        ) {
          return res.status(200).json({
            success: false,
            message: `Room is already booked on ${day} from ${start} to ${end}`,
            data: false,
          });
        }
      }
    }

    res.status(200).json({ success: true, message: "Room is available for the specified period and time.", data: true });
  } catch (error) {
    console.error('Error checking room availability:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


 const checkGroupAvailability = asyncHandler(async (req, res) => {
  const { emploiDateId, sessions } = req.body;
  const { groupId } = req.params;

  try {
    const emploiDate = await DateEmploi.findById(emploiDateId);  
    if (!emploiDate) {
      return res.status(404).json({ success: false, message: "Emploi date not found" });
    }

    const existingTimetables = await Timetable.find({
      "sessions.group": groupId,
      emploiDateId: emploiDate._id,
    });

    for (const timetable of existingTimetables) {
      for (const newSession of timetable.sessions) {
        if (
          newSession.day === sessions.day &&
          ((newSession.start < sessions.end && newSession.start >= sessions.start) ||
            (newSession.end > sessions.start && newSession.end <= sessions.end))
        ) {
          return res.status(200).json({
            success: false,
            message: `Group is already reserved on ${newSession.day} from ${newSession.start} to ${newSession.end}`,
            data: false,
          });
        }
      }
    }

    res.status(200).json({ success: true, message: "Group is available for the specified period and time.", data: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const groupTimeTable = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  try {
     const timetables = await Timetable.find({ "sessions.group": groupId })
      .populate('professorId')
      .populate('emploiDateId')
      .populate('sessions.matiere')
      .populate('sessions.room')
      .populate('sessions.group');

    if (timetables.length === 0) {
      return res.status(404).json({ success: false, message: "No timetables found for this group" });
    }

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
 
module.exports = {
  postTimetable,
  getTimetableByProfessor,
  updateTimetable,
  deleteTimetable,
  checkDateForThisProfessor,
  getTimetableById,
  groupTimeTable,
  checkRoomAvailability,
  checkGroupAvailability,
};
