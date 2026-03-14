const mongoose = require('mongoose')
const Donation = require('../models/Donation')
const Charity = require('../models/Charity')
const User = require('../models/User')
const manus = require('../services/manus')

const MOCK_DONATIONS = [
  {
    id: 'mock-1',
    _id: 'mock-1',
    amount: 0.47,
    triggeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed',
    charityId: { name: 'Greater Chicago Food Depository', category: 'Food' }
  },
  {
    id: 'mock-2',
    _id: 'mock-2',
    amount: 0.83,
    triggeredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'completed',
    charityId: { name: 'Chicago Coalition for the Homeless', category: 'Housing' }
  },
  {
    id: 'mock-3',
    _id: 'mock-3',
    amount: 0.62,
    triggeredAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    status: 'completed',
    charityId: { name: 'Thresholds', category: 'Mental Health' }
  }
]

async function create(req, res) {
  try {
    const { userId, charityId, amount } = req.body

    if (!userId || !charityId || !amount) {
      return res.status(400).json({ error: 'userId, charityId, and amount are required' })
    }

    const charity = await Charity.findById(charityId)
    if (!charity) return res.status(404).json({ error: 'Charity not found' })

    manus.triggerAgent(charity.donateUrl, amount)

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

    // Resolve Clerk ID to MongoDB _id
    let mongoUserId = userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findOne({ clerkId: userId })
      mongoUserId = user ? user._id : null
    }

    const donations = mongoUserId
      ? await Donation.find({ userId: mongoUserId }).sort({ triggeredAt: -1 }).populate('charityId')
      : []

    // Return mock donations alongside real ones for demo
    const combined = [...donations, ...MOCK_DONATIONS]
    res.json(combined)
  } catch (err) {
    console.error('getByUser donation error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { create, getByUser }
