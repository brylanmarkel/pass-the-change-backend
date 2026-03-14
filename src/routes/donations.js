const express = require('express')
const donationController = require('../controllers/donationController')

const router = express.Router()

router.post('/', donationController.create)
router.get('/:userId', donationController.getByUser)

module.exports = router
