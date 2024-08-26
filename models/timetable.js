const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  emploiDateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploiDates', required: true },
  sessions: [{
    day: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
  }],
  timeSlots: [{
    start: { type: String, required: true },
    end: { type: String, required: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
