require('dotenv').config()
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Charity = require('../src/models/Charity')

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

function csvRowToCharity(row) {
  const [name, link, category, location, description, tagsStr, programsStr, whoTheyServe, neighborhood, impact, themesStr, ageGroup, volunteerFriendlyStr] = row

  const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : []
  const programs = programsStr ? programsStr.split(';').map((p) => p.trim()).filter(Boolean) : []
  const themes = themesStr ? themesStr.split(',').map((t) => t.trim()).filter(Boolean) : []
  const volunteerFriendly = (volunteerFriendlyStr || '').toLowerCase() === 'yes'

  const baseLink = (link || '').replace(/\/$/, '')
  const donateUrl = baseLink ? `${baseLink}/donate` : ''

  return {
    name: name || '',
    link: link || '',
    category: category || '',
    location: location || '',
    description: description || '',
    tags,
    programs,
    whoTheyServe: whoTheyServe || '',
    neighborhood: neighborhood || '',
    impact: impact || '',
    themes,
    ageGroup: ageGroup || '',
    volunteerFriendly,
    logoUrl: '',
    donateUrl
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected')

    const csvPath = path.join(__dirname, 'chicago_nonprofits.csv')
    const content = fs.readFileSync(csvPath, 'utf8')
    const lines = content.split('\n').filter((line) => line.trim())

    const charities = []

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      if (row.length >= 13) {
        charities.push(csvRowToCharity(row))
      }
    }

    await Charity.deleteMany()
    console.log('Cleared existing charities')

    const inserted = await Charity.insertMany(charities)
    console.log(`Seeded ${inserted.length} charities`)

    await mongoose.disconnect()
    console.log('Done')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
