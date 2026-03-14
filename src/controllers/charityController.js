const Charity = require('../models/Charity')
const User = require('../models/User')

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

    const { onboardingAnswers, causes } = user

    const charities = await Charity.find()

    const scored = charities.map((charity) => {
      let score = 0

      // Score by cause/category match (multi-select)
      if (causes && causes.length > 0 && charity.category) {
        const userCauseLower = causes.map((c) => c.toLowerCase().trim())
        if (userCauseLower.includes(charity.category.toLowerCase())) {
          score += 3
        }
      }

      // Score by onboarding answer keywords
      if (onboardingAnswers && onboardingAnswers.length > 0) {
        const keywords = onboardingAnswers
          .join(' ')
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3)

        const searchable = [
          ...(charity.tags || []),
          ...(charity.themes || [])
        ]
          .join(' ')
          .toLowerCase()

        score += keywords.reduce((count, keyword) => {
          return count + (searchable.includes(keyword) ? 1 : 0)
        }, 0)
      }

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

module.exports = { getCauseOptions, getAll, matchForUser }
