const express = require('express')
const { requireAuth } = require('@clerk/clerk-sdk-node')
const charityController = require('../controllers/charityController')

const router = express.Router()

router.get('/', requireAuth(), charityController.getAll)
router.get('/match/:userId', requireAuth(), charityController.matchForUser)

module.exports = router
