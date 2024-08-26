const express = require("express");
const router = express.Router();
const groupController = require("../controller/groupController");

 router.post("/", groupController.createGroup);

 router.get("/", groupController.getAllGroups);

 router.get("/:id", groupController.getGroupById);

 router.put("/:id", groupController.updateGroup);

 router.delete("/:id", groupController.deleteGroup);

 router.get('/:id/timetable', groupController.getGroupTimetableById);

module.exports = router;
