const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router()

router.post('/onboarding', userController.onboarding)
router.patch('/:userId', userController.update)

module.exports = router
