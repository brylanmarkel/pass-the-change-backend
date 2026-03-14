/**
 * Verifies vector search match logic (no HTTP/auth).
 * Run: node scripts/verify-match.js
 */
require('dotenv').config()
const mongoose = require('mongoose')
const { runMatchAndSave } = require('../src/services/charityMatch')
const User = require('../src/models/User')

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI)

  let user = await User.findOne()
  if (!user) {
    user = await User.create({
      clerkId: 'verify-test-' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      causes: ['Food', 'Youth Development'],
      onboardingAnswers: [
        'Hunger relief and feeding families',
        'Education for underserved youth',
        'Food security in Chicago',
        'Teaching kids to read'
      ]
    })
    console.log('Created test user with 4 answers')
  }

  console.log('Test user:', user.name, '| Answers:', user.onboardingAnswers?.length || 0)

  try {
    const { charities } = await runMatchAndSave(user._id, user.onboardingAnswers, user.causes)
    console.log(`Top 10 matches (${charities.length}):`)
    charities.forEach((c, i) => console.log(`  ${i + 1}. ${c.name} (${c.category})`))
    if (charities.length === 0) {
      console.log('  (If 0: ensure Atlas vector index "charity_embeddings" exists and is Ready)')
    }
    console.log('Match + save OK')
  } catch (err) {
    console.error('Match failed:', err.message)
    process.exit(1)
  }

  await mongoose.disconnect()
  process.exit(0)
}

verify().catch((e) => {
  console.error(e)
  process.exit(1)
})
