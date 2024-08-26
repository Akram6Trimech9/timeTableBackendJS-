const mongoose = require("mongoose");

const matiereSchema = new mongoose.Schema(
  {
    matiereName: {
      type: String,
      required: true,
    },
    departement:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departements",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Matiere", matiereSchema);
