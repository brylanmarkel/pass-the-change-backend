const Donation = require('../models/Donation')
const Charity = require('../models/Charity')
const manus = require('../services/manus')

async function create(req, res) {
  try {
    const { userId, charityId, amount } = req.body

    if (!userId || !charityId || !amount) {
      return res.status(400).json({ error: 'userId, charityId, and amount are required' })
    }

    const charity = await Charity.findById(charityId)
    if (!charity) return res.status(404).json({ error: 'Charity not found' })

    manus.triggerAgent(charity.donateUrl, amount) // fire and forget — no await

    const donation = await Donation.create({
      userId,
      charityId,
      amount,
      triggeredAt: new Date(),
      status: 'completed'
    })

    res.json({ success: true, donation })
  } catch (err) {
    console.error('create donation error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

async function getByUser(req, res) {
  try {
    const { userId } = req.params

    const donations = await Donation.find({ userId })
      .sort({ triggeredAt: -1 })
      .populate('charityId')

    res.json(donations)
  } catch (err) {
    console.error('getByUser donation error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { create, getByUser }
