const express = require('express')
const { requireAuth } = require('@clerk/clerk-sdk-node')
const plaidController = require('../controllers/plaidController')

const router = express.Router()

router.post('/link', requireAuth(), plaidController.linkAccount)
router.get('/transactions', requireAuth(), plaidController.getTransactions)

module.exports = router
