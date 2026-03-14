const express = require('express')
const { requireAuth } = require('@clerk/clerk-sdk-node')
const userController = require('../controllers/userController')

const router = express.Router()

router.post('/onboarding', userController.onboarding)
router.patch('/:userId', requireAuth(), userController.update)

module.exports = router
