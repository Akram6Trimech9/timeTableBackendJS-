const Room = require('../models/room');
const Departement = require('../models/departement');
const asyncHandler = require('express-async-handler');

 const postRoom = asyncHandler(async (req, res) => {
    const { roomName, capacity, DepartementId } = req.body;
    try {
        const existingRoom = await Room.findOne({ roomName: roomName });
        if (existingRoom) {
            return res.status(400).json({ success: false, message: "Room with this name already exists" });
        }
        const newRoom = new Room({
            roomName,
            capacity,
            departement: DepartementId
        });
        const savedRoom = await newRoom.save();

        if (savedRoom && DepartementId) {
            await Departement.findByIdAndUpdate(
                DepartementId,
                { $push: { rooms: savedRoom._id } },
                { new: true }
            );
        }
        res.status(201).json({ success: true, data: savedRoom });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const getRooms = asyncHandler(async (req, res) => {
    try {
        const rooms = await Room.find().populate('departement', 'name');
        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const getRoomById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const room = await Room.findById(id).populate('departement', 'name');
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const updateRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { roomName, capacity, DepartementId } = req.body;

    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { roomName, capacity, departement: DepartementId },
            { new: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        if (DepartementId) {
            await Departement.findByIdAndUpdate(
                DepartementId,
                { $addToSet: { rooms: updatedRoom._id } }
            );
        }

        res.status(200).json({ success: true, data: updatedRoom });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 const deleteRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRoom = await Room.findByIdAndDelete(id);

        if (!deletedRoom) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        if (deletedRoom.departement) {
            await Departement.findByIdAndUpdate(
                deletedRoom.departement,
                { $pull: { rooms: deletedRoom._id } }
            );
        }

        res.status(200).json({ success: true, message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

 module.exports = {
    postRoom,
    getRooms,
    getRoomById,
    updateRoom,
    deleteRoom
};
