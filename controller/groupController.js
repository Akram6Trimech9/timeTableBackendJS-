const Group = require("../models/groups");

 exports.createGroup = async (req, res) => {
  try {
    const { groupeName, studentsNumber } = req.body;

     const group = new Group({
      groupeName,
      studentsNumber,
    });

     await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

 exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups", error: error.message });
  }
};

 exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error fetching group", error: error.message });
  }
};

 exports.updateGroup = async (req, res) => {
  try {
    const { groupeName, studentsNumber } = req.body;

     const group = await Group.findByIdAndUpdate(
      req.params.id,
      { groupeName, studentsNumber },
      { new: true, runValidators: true }   
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Group updated successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error updating group", error: error.message });
  }
};

 exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting group", error: error.message });
  }
};

 
exports.getGroupTimetableById = async (req, res) => {
  try {
    const groupId = req.params.id;
    
     const group = await Group.findById(groupId)
      .populate({
        path: 'timeTable.emploiDateId',  
        model: 'EmploiDates'
      })
      .populate({
        path: 'timeTable.sessions.matiere',  
        model: 'Matiere'
      })
      .populate({
        path: 'timeTable.sessions.room',  
        model: 'Room'
      })
      .populate({
        path: 'timeTable.sessions.professorId',  
        model: 'Teacher'
      });

     if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Return the populated group data
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
