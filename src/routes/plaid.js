const express = require('express')
const mongoose = require('mongoose')
const plaidController = require('../controllers/plaidController')
const User = require('../models/User')

const router = express.Router()

router.post('/link', plaidController.linkAccount)
router.get('/transactions', plaidController.getTransactions)

async function markPlaidLinked(userId) {
  if (!userId) return
  try {
    const filter = mongoose.Types.ObjectId.isValid(userId)
      ? { _id: userId }
      : { clerkId: userId }
    await User.findOneAndUpdate(filter, { $set: { plaidLinked: true } })
  } catch (_) {}
}

// Fake Plaid endpoints — mark user as linked for demo
router.get('/link-token', async (req, res) => {
  await markPlaidLinked(req.query.userId)
  res.json({ link_token: 'fake-link-token-for-testing', expiration: null })
})
router.post('/link-token', async (req, res) => {
  await markPlaidLinked(req.body.userId)
  res.json({ link_token: 'fake-link-token-for-testing', expiration: null })
})
router.post('/exchange-token', async (req, res) => {
  await markPlaidLinked(req.body.userId)
  res.json({ access_token: 'fake-access-token', item_id: 'fake-item-id' })
})

module.exports = router
