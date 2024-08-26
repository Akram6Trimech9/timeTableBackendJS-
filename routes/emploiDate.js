const express = require("express");
const router = express.Router();
const {
  createEmploiDate,
  getAllEmploiDates,
  getEmploiDateById,
  updateEmploiDate,
  deleteEmploiDate,
} = require("../controller/emploiDatesController");
router.post("/", createEmploiDate);
router.get("/", getAllEmploiDates);
router.get("/:id", getEmploiDateById);
router.put("/:id", updateEmploiDate);
router.delete("/:id", deleteEmploiDate);

module.exports = router;
