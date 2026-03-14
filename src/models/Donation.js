const mongoose = require('mongoose')

const donationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', required: true },
  amount: { type: Number, required: true },
  triggeredAt: { type: Date, default: Date.now },
  status: { type: String, default: 'completed' }
})

module.exports = mongoose.model('Donation', donationSchema)
