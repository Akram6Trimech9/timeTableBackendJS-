const asyncHandler = require("express-async-handler");
const EmploiDates = require("../models/EmploisDates");

 const createEmploiDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  const emploiDate = new EmploiDates({
    startDate,
    endDate,
  });

  const createdEmploiDate = await emploiDate.save();
  res.status(201).json(createdEmploiDate);
});

 const getAllEmploiDates = asyncHandler(async (req, res) => {
  const emploiDates = await EmploiDates.find({});
  res.json(emploiDates);
});

 const getEmploiDateById = asyncHandler(async (req, res) => {
  const emploiDate = await EmploiDates.findById(req.params.id);

  if (emploiDate) {
    res.json(emploiDate);
  } else {
    res.status(404).json({ message: "Emploi Date not found" });
  }
});

 const updateEmploiDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  const emploiDate = await EmploiDates.findById(req.params.id);

  if (emploiDate) {
    emploiDate.startDate = startDate || emploiDate.startDate;
    emploiDate.endDate = endDate || emploiDate.endDate;

    const updatedEmploiDate = await emploiDate.save();
    res.json(updatedEmploiDate);
  } else {
    res.status(404).json({ message: "Emploi Date not found" });
  }
});

 const deleteEmploiDate = asyncHandler(async (req, res) => {
  const emploiDate = await EmploiDates.findByIdAndDelete(req.params.id);

  if (emploiDate) {
     res.json({ message: "Emploi Date removed" });
  } else {
    res.status(404).json({ message: "Emploi Date not found" });
  }
});

module.exports = {
  createEmploiDate,
  getAllEmploiDates,
  getEmploiDateById,
  updateEmploiDate,
  deleteEmploiDate,
};
