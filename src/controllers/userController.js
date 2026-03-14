const User = require('../models/User')
const { runMatchAndSave } = require('../services/charityMatch')

async function onboarding(req, res) {
  try {
    const { clerkId, name, email, onboardingAnswers, causes } = req.body

    if (!clerkId || !name || !email) {
      return res.status(400).json({ error: 'clerkId, name, and email are required' })
    }

    const existing = await User.findOne({ clerkId })
    if (existing) {
      return res.status(200).json(existing)
    }

    const user = await User.create({ clerkId, name, email, onboardingAnswers: onboardingAnswers || [], causes: causes || [] })

    if (onboardingAnswers && onboardingAnswers.length >= 4) {
      const { charityIds } = await runMatchAndSave(user._id, onboardingAnswers, causes)
      user.matchedCharityIds = charityIds
    }

    res.status(201).json(user)
  } catch (err) {
    console.error('onboarding error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

async function update(req, res) {
  try {
    const { userId } = req.params
    const { onboardingAnswers, causes, charityIds } = req.body

    const updates = {}
    if (onboardingAnswers) updates.onboardingAnswers = onboardingAnswers
    if (causes) updates.causes = causes
    if (charityIds) updates.charityIds = charityIds

    let user = await User.findByIdAndUpdate(userId, updates, { new: true })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const answers = updates.onboardingAnswers ?? user.onboardingAnswers
    const userCauses = updates.causes ?? user.causes
    if (answers && answers.length >= 4) {
      const { charityIds } = await runMatchAndSave(userId, answers, userCauses)
      user = await User.findByIdAndUpdate(userId, { $set: { matchedCharityIds: charityIds } }, { new: true })
    }

    res.json(user)
  } catch (err) {
    console.error('update user error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { onboarding, update }
