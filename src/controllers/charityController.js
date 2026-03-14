const Charity = require('../models/Charity')
const User = require('../models/User')

async function getAll(req, res) {
  try {
    const charities = await Charity.find()
    res.json(charities)
  } catch (err) {
    console.error('getAll charities error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

async function matchForUser(req, res) {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { onboardingAnswers } = user

    if (!onboardingAnswers || onboardingAnswers.length === 0) {
      const charities = await Charity.find().limit(3)
      return res.json(charities)
    }

    // Build a list of keywords from onboarding answers
    const keywords = onboardingAnswers
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)

    const charities = await Charity.find()

    const scored = charities.map((charity) => {
      const searchable = [
        ...(charity.tags || []),
        ...(charity.themes || [])
      ]
        .join(' ')
        .toLowerCase()

      const score = keywords.reduce((count, keyword) => {
        return count + (searchable.includes(keyword) ? 1 : 0)
      }, 0)

      return { charity, score }
    })

    const top3 = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.charity)

    res.json(top3)
  } catch (err) {
    console.error('matchForUser error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getAll, matchForUser }
