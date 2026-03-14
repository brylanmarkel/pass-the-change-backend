/**
 * Generates embeddings for all charities and saves them to MongoDB.
 * Run: node seed/embed-charities.js (requires OPENAI_API_KEY in .env)
 *
 * Idempotent: only embeds docs missing embedding or with empty array.
 * Uses text-embedding-3-small (1536 dimensions) - matches Atlas index config.
 */
require('dotenv').config()
const mongoose = require('mongoose')
const OpenAI = require('openai').default
const Charity = require('../src/models/Charity')

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536
const RETRY_DELAY_MS = 2000
const RATE_LIMIT_DELAY_MS = 150

async function embedOne(openai, c, index, total) {
  const text = [c.name, c.description, c.category, ...(c.tags || []), ...(c.themes || [])].filter(Boolean).join(' ')

  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  const embedding = res.data[0].embedding

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`)
  }

  await Charity.updateOne({ _id: c._id }, { $set: { embedding } })
  console.log(`  [${index}/${total}] ${c.name}`)
}

async function embedCharities() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Set OPENAI_API_KEY in .env')
    process.exit(1)
  }

  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  const totalCount = await Charity.countDocuments()
  const missingCount = await Charity.countDocuments({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }]
  })
  const withEmbedding = totalCount - missingCount

  console.log(`Charities: ${totalCount} total, ${withEmbedding} with embeddings, ${missingCount} to process`)

  if (missingCount === 0) {
    console.log('All charities already have embeddings. Done.')
    await mongoose.disconnect()
    process.exit(0)
    return
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const charities = await Charity.find({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }]
  })

  let ok = 0
  let failed = 0

  for (let i = 0; i < charities.length; i++) {
    const c = charities[i]
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await embedOne(openai, c, i + 1, charities.length)
        ok++
        break
      } catch (err) {
        if (attempt < 2) {
          console.log(`  Retry in ${RETRY_DELAY_MS / 1000}s...`)
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        } else {
          console.error(`  FAILED [${i + 1}/${charities.length}] ${c.name}:`, err.message)
          failed++
        }
      }
    }

    await new Promise((r) => setTimeout(r, RATE_LIMIT_DELAY_MS))
  }

  const stillMissing = await Charity.countDocuments({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }]
  })

  console.log(`Done. Embedded: ${ok}, failed: ${failed}, still missing: ${stillMissing}`)
  await mongoose.disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

embedCharities().catch((err) => {
  console.error(err)
  process.exit(1)
})
