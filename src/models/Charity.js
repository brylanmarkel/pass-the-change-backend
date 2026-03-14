const mongoose = require('mongoose')

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: String,
  category: String,
  location: String,
  description: String,
  tags: [String],
  programs: [String],
  whoTheyServe: String,
  neighborhood: String,
  impact: String,
  themes: [String],
  ageGroup: String,
  volunteerFriendly: { type: Boolean, default: false },
  logoUrl: String,
  donateUrl: String,
  embedding: [Number],
  supporterCount: { type: Number, default: 0 },
  color: String,
  emoji: String
})

module.exports = mongoose.model('Charity', charitySchema)
