const mongoose = require("mongoose");

const groupeSchema = new mongoose.Schema(
  {
    groupeName: {
      type: String,
      required: true,
    },
    studentsNumber: {
      type: String,
      required: true,
    },

    timeTable: [{ 
      emploiDateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploiDates' },
      sessions: [{
        day: { type: String },
        start: { type: String },
        end: { type: String },
        matiere: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere' },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
        professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
      }],
    }]
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Group", groupeSchema);
