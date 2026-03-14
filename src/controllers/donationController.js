const mongoose = require('mongoose')
const Donation = require('../models/Donation')
const Charity = require('../models/Charity')
const User = require('../models/User')
const manus = require('../services/manus')

const MOCK_AMOUNTS = [0.47, 0.83, 0.62]
const MOCK_DAYS_AGO = [7, 14, 21]

function buildMockDonations(charities) {
  return charities.slice(0, 3).map((charity, i) => ({
    id: `mock-${i + 1}`,
    _id: `mock-${i + 1}`,
    amount: MOCK_AMOUNTS[i],
    triggeredAt: new Date(Date.now() - MOCK_DAYS_AGO[i] * 24 * 60 * 60 * 1000),
    status: 'completed',
    charityId: {
      _id: charity._id,
      name: charity.name,
      category: charity.category,
      logoUrl: charity.logoUrl
    }
  }))
}

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

    // Resolve Clerk ID → User doc
    let user = null
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId)
    }
    if (!user) {
      user = await User.findOne({ clerkId: userId })
    }

    const mongoUserId = user?._id ?? null

    const realDonations = mongoUserId
      ? await Donation.find({ userId: mongoUserId }).sort({ triggeredAt: -1 }).populate('charityId')
      : []

    // Build mock donations from user's matched charities so they feel personal
    let mockDonations = []
    if (realDonations.length === 0 && user) {
      const charityIds = user.matchedCharityIds?.length
        ? user.matchedCharityIds
        : user.charityIds

      if (charityIds?.length) {
        const charities = await Charity.find({ _id: { $in: charityIds } }).limit(3)
        mockDonations = buildMockDonations(charities)
      }
    }

    res.json([...realDonations, ...mockDonations])
  } catch (err) {
    console.error('getByUser donation error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { create, getByUser }
