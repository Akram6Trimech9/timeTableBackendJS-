const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    capacity:{
        type:Number , 
        required: true
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

module.exports = mongoose.model("Room", roomSchema);
