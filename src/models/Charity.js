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
  donateUrl: String
})

module.exports = mongoose.model('Charity', charitySchema)
