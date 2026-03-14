const Charity = require('../models/Charity')
const User = require('../models/User')
const { runMatchAndSave } = require('../services/charityMatch')
const { toFrontendShape } = require('../utils/charityShape')
const { normalizeAnswers } = require('../utils/normalizeAnswers')

const CAUSE_OPTIONS = [
  'Addiction Recovery', 'Animal', 'Arts & Culture', 'Criminal Justice',
  'Economic Mobility', 'Education', 'Environment', 'Food', 'Housing',
  'International Support', 'LGBTQ', 'Mental Health', 'Volunteering',
  'Women Empowerment', 'Youth Development'
]

async function getCauseOptions(req, res) {
  res.json(CAUSE_OPTIONS)
}

async function getAll(req, res) {
  try {
    const charities = await Charity.find()
    const shaped = charities.map((c) => toFrontendShape(c))
    res.json(shaped)
  } catch (err) {
    console.error('getAll charities error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

async function matchForUser(req, res) {
  try {
    const { userId } = req.params

    const user =
      (await User.findById(userId)) ?? (await User.findOne({ clerkId: userId }))
    if (!user) return res.status(404).json({ error: 'User not found' })

    const answers = normalizeAnswers(user.onboardingAnswers)
    let charities = []
    try {
      const result = await runMatchAndSave(user._id, answers, user.causes || [])
      charities = result.charities || []
    } catch (matchErr) {
      console.error('runMatchAndSave error:', matchErr.message, matchErr.stack)
    }
    const shaped = charities.map((c) => toFrontendShape(c))
    res.json(shaped)
  } catch (err) {
    console.error('matchForUser error:', err.message, err.stack)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getCauseOptions, getAll, matchForUser }
