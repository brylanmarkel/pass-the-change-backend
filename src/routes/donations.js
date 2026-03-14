const express = require('express')
const { requireAuth } = require('@clerk/clerk-sdk-node')
const donationController = require('../controllers/donationController')

const router = express.Router()

router.post('/', requireAuth(), donationController.create)
router.get('/:userId', requireAuth(), donationController.getByUser)

module.exports = router
