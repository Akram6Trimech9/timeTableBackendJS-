const mongoose = require('mongoose');

const departementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
 
    photo: {
        type: String, 
    },
    
    teachers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Teacher',
        },
    ],
    rooms: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
        },
    ],
    matieres: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Matiere',
        },
    ],
 }, {
    timestamps: true
});

module.exports = mongoose.model('Departements', departementSchema);
