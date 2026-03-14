const Donation = require('../models/Donation')

const MOCK_CHICAGO_STATS = {
  totalDonors: 1284,
  totalDonated: 42817.53,
  orgsSupported: 38,
  avgPerPerson: 33.35
}

async function getChicagoStats(req, res) {
  try {
    const allDonations = await Donation.find({ status: 'completed' })

    const realTotal = allDonations.reduce((sum, d) => sum + d.amount, 0)
    const uniqueDonorIds = new Set(allDonations.map((d) => d.userId.toString()))
    const uniqueCharityIds = new Set(allDonations.map((d) => d.charityId.toString()))

    // Blend real data on top of mock base numbers
    const totalDonated = parseFloat((MOCK_CHICAGO_STATS.totalDonated + realTotal).toFixed(2))
    const totalDonors = MOCK_CHICAGO_STATS.totalDonors + uniqueDonorIds.size
    const orgsSupported = MOCK_CHICAGO_STATS.orgsSupported + uniqueCharityIds.size
    const avgPerPerson = totalDonors > 0 ? parseFloat((totalDonated / totalDonors).toFixed(2)) : MOCK_CHICAGO_STATS.avgPerPerson

    res.json({ totalDonors, totalDonated, orgsSupported, avgPerPerson })
  } catch (err) {
    console.error('getChicagoStats error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getChicagoStats }
