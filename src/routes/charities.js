const express = require('express')
const charityController = require('../controllers/charityController')

const router = express.Router()

router.get('/causes', charityController.getCauseOptions)
router.get('/', charityController.getAll)
router.get('/match/:userId', charityController.matchForUser)

module.exports = router
