const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  onboardingAnswers: [String],
  causes: [String],
  charityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Charity' }],
  matchedCharityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Charity' }],
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
