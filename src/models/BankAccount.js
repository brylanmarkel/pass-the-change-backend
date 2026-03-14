const mongoose = require('mongoose')

const bankAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plaidAccessToken: { type: String, required: true },
  accountId: { type: String, required: true },
  lastPaycheck: { type: Number },
  payFrequency: { type: String }
})

module.exports = mongoose.model('BankAccount', bankAccountSchema)
