const Donation = require('../models/Donation')

async function getChicagoStats(req, res) {
  try {
    const allDonations = await Donation.find({ status: 'completed' })

    const totalDonated = allDonations.reduce((sum, d) => sum + d.amount, 0)

    const uniqueDonorIds = new Set(allDonations.map((d) => d.userId.toString()))
    const totalDonors = uniqueDonorIds.size

    const uniqueCharityIds = new Set(allDonations.map((d) => d.charityId.toString()))
    const orgsSupported = uniqueCharityIds.size

    const avgPerPerson = totalDonors > 0 ? parseFloat((totalDonated / totalDonors).toFixed(2)) : 0

    res.json({ totalDonors, totalDonated: parseFloat(totalDonated.toFixed(2)), orgsSupported, avgPerPerson })
  } catch (err) {
    console.error('getChicagoStats error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getChicagoStats }
