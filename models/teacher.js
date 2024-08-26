const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    grade: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    departement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departements",
    },
    timeTables:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timetable",
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Teacher", teacherSchema);
