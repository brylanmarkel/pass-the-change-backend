const express = require('express')
const impactController = require('../controllers/impactController')

const router = express.Router()

router.get('/chicago', impactController.getChicagoStats)

module.exports = router
