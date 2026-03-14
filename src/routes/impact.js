const express = require('express')
const { requireAuth } = require('@clerk/clerk-sdk-node')
const impactController = require('../controllers/impactController')

const router = express.Router()

router.get('/chicago', requireAuth(), impactController.getChicagoStats)

module.exports = router
