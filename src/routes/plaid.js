const express = require('express')
const plaidController = require('../controllers/plaidController')

const router = express.Router()

router.post('/link', plaidController.linkAccount)
router.get('/transactions', plaidController.getTransactions)

module.exports = router
