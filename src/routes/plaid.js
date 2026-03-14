const express = require('express')
const plaidController = require('../controllers/plaidController')

const router = express.Router()

router.post('/link', plaidController.linkAccount)
router.get('/transactions', plaidController.getTransactions)

// Fake Plaid endpoints for frontend testing
router.get('/link-token', (req, res) => {
  res.json({ link_token: 'fake-link-token-for-testing', expiration: null })
})
router.post('/link-token', (req, res) => {
  res.json({ link_token: 'fake-link-token-for-testing', expiration: null })
})
router.post('/exchange-token', (req, res) => {
  res.json({ access_token: 'fake-access-token', item_id: 'fake-item-id' })
})

module.exports = router
