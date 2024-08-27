const mongoose = require("mongoose");

const emploiDatesSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmploiDates", emploiDatesSchema);
