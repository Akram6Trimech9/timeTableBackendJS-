const Teacher = require('../models/teacher');
const  Group = require('../models/groups');
const matiere = require('../models/historique');

 const getTotalUsers = async (req, res) => {
    try {
        const userCount = await Chauffeur.countDocuments();
        res.status(200).json({ totalUsers: userCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total users count' });
    }
};

 const getTotalFournisseurs = async (req, res) => {
    try {
        const fournisseurCount = await Fournisseur.countDocuments();
        res.status(200).json({ totalFournisseurs: fournisseurCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total fournisseurs count' });
    }
};

 const getTotalCredit = async (req, res) => {
    try {
        const totalCredit = await Fournisseur.aggregate([
            { $group: { _id: null, totalCredit: { $sum: "$credit" } } },
            { $project: { _id: 0, totalCredit: 1 } }
        ]);
        res.status(200).json(totalCredit[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total credit' });
    }
};

 const getMonthlyCreditAddition = async (req, res) => {
    try {
        const monthlyCredit = await CreditHistory.aggregate([
            { $match: { type: 'credit' } },
            { 
                $group: {
                    _id: { $month: "$createdAt" },
                    totalCredit: { $sum: "$amount" }
                } 
            },
            { $project: { month: "$_id", totalCredit: 1, _id: 0 } },
            { $sort: { month: 1 } }
        ]);
        res.status(200).json(monthlyCredit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch monthly credit addition' });
    }
};

 const getAllStatistics = async (req, res) => {
    try {
        const userCount = await Chauffeur.countDocuments();
        const fournisseurCount = await Fournisseur.countDocuments();
        const totalCreditResult = await Fournisseur.aggregate([
            { $group: { _id: null, totalCredit: { $sum: "$credit" } } },
            { $project: { _id: 0, totalCredit: 1 } }
        ]);
        const totalCredit = totalCreditResult[0]?.totalCredit || 0;
        const monthlyCredit = await CreditHistory.aggregate([
            { $match: { type: 'credit' } },
            { 
                $group: {
                    _id: { $month: "$createdAt" },
                    totalCredit: { $sum: "$amount" }
                } 
            },
            { $project: { month: "$_id", totalCredit: 1, _id: 0 } },
            { $sort: { month: 1 } }
        ]);

        res.status(200).json({
            totalUsers: userCount,
            totalFournisseurs: fournisseurCount,
            totalCredit,
            monthlyCredit
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

module.exports = {
    getTotalUsers,
    getTotalFournisseurs,
    getTotalCredit,
    getMonthlyCreditAddition,
    getAllStatistics
};
