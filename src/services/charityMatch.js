/**
 * Embeds user's 4 onboarding answers + causes, runs vector similarity search,
 * returns top 10 charities. Saves matchedCharityIds to user when provided.
 */
const OpenAI = require('openai').default
const Charity = require('../models/Charity')
const User = require('../models/User')

const EMBEDDING_MODEL = 'text-embedding-3-small'
const VECTOR_INDEX_NAME = 'charity_embeddings'
const MATCH_LIMIT = 10
const NUM_CANDIDATES = 50

function keywordMatchFallback(charities, causes, onboardingAnswers, limit) {
  const answers = Array.isArray(onboardingAnswers) ? onboardingAnswers : onboardingAnswers ? Object.values(onboardingAnswers) : []
  const scored = charities.map((charity) => {
    let score = 0
    if (causes && causes.length > 0 && charity.category) {
      const userCauseLower = causes.map((c) => c.toLowerCase().trim())
      if (userCauseLower.includes(charity.category.toLowerCase())) score += 3
    }
    if (answers && answers.length > 0) {
      const keywords = answers
        .join(' ')
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)
      const searchable = [...(charity.tags || []), ...(charity.themes || [])].join(' ').toLowerCase()
      score += keywords.reduce((count, keyword) => count + (searchable.includes(keyword) ? 1 : 0), 0)
    }
    return { charity, score }
  })
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.charity)
}

/**
 * Runs semantic match using 4 onboarding answers + causes.
 * Returns { charities, charityIds } (top 10). Saves to user if userId provided.
 */
async function runMatchAndSave(userId, onboardingAnswers, causes) {
  const answers = Array.isArray(onboardingAnswers) ? onboardingAnswers : onboardingAnswers ? Object.values(onboardingAnswers) : []
  const queryParts = [...(causes || []), ...answers].filter(Boolean)
  const queryText = queryParts.join('. ').trim() || 'Chicago nonprofit charity'

  let charities = []
  const openaiKey = process.env.OPENAI_API_KEY

  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey })
      const embRes = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: queryText })
      const queryVector = embRes.data[0].embedding

      const results = await Charity.aggregate([
        {
          $vectorSearch: {
            index: VECTOR_INDEX_NAME,
            path: 'embedding',
            queryVector,
            numCandidates: NUM_CANDIDATES,
            limit: MATCH_LIMIT
          }
        },
        { $project: { embedding: 0 } }
      ])

      if (results.length > 0) {
        charities = results
      }
    } catch (vecErr) {
      console.warn('Vector search fallback to keyword match:', vecErr.message)
    }
  }

  if (charities.length === 0) {
    try {
      const all = await Charity.find()
      charities = keywordMatchFallback(all, causes, onboardingAnswers, MATCH_LIMIT)
    } catch (kwErr) {
      console.warn('Keyword match fallback error:', kwErr.message)
    }
  }

  const charityIds = charities.map((c) => c._id)

  if (userId && charityIds.length > 0) {
    try {
      await User.findByIdAndUpdate(userId, { $set: { matchedCharityIds: charityIds } })
    } catch (upErr) {
      console.warn('Save matchedCharityIds error:', upErr.message)
    }
  }

  return { charities, charityIds }
}

module.exports = { runMatchAndSave, keywordMatchFallback }
