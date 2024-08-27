const Teacher = require('../models/teacher');
const  Group = require('../models/groups');
const  Departement = require('../models/departement');

const Matiere = require('../models/matiere');

 const getTotalUsers = async (req, res) => {
    try {
        const userCount = await Teacher.countDocuments();
        res.status(200).json({ totalUsers: Teacher });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total users count' });
    }
};

 const getTotalFournisseurs = async (req, res) => {
    try {
        const fournisseurCount = await Departement.countDocuments();
        res.status(200).json({ totalFournisseurs: fournisseurCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total fournisseurs count' });
    }
};

 const getTotalCredit = async (req, res) => {
    try {
        const totalCredit = await Matiere.countDocuments();
        res.status(200).json( totalCredit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total credit' });
    }
};
 
 const getAllStatistics = async (req, res) => {
    try {
        const userCount = await Teacher.countDocuments();
        const fournisseurCount = await Departement.countDocuments();
        const totalCredit = await Group.countDocuments( );
   

        res.status(200).json({
            totalUsers: userCount,
            totalFournisseurs: fournisseurCount,
            totalCredit:totalCredit,
         });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

module.exports = {
    getTotalUsers,
    getTotalFournisseurs,
    getTotalCredit,
     getAllStatistics
};
