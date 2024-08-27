const express = require('express');
const router = express.Router();
const statisticsController = require('../controller/statsController');

router.get('/total-users', statisticsController.getTotalUsers);
router.get('/total-fournisseurs', statisticsController.getTotalFournisseurs);
router.get('/total-credit', statisticsController.getTotalCredit);
 router.get('/all-statistics', statisticsController.getAllStatistics);

module.exports = router;
