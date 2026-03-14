const { PlaidApi, PlaidEnvironments, Configuration } = require('plaid')
const BankAccount = require('../models/BankAccount')
const User = require('../models/User')

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET
    }
  }
})

const plaidClient = new PlaidApi(plaidConfig)

async function linkAccount(req, res) {
  try {
    const { userId, publicToken } = req.body

    if (!userId || !publicToken) {
      return res.status(400).json({ error: 'userId and publicToken are required' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token: publicToken })
    const accessToken = exchangeRes.data.access_token

    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken })
    const accountId = accountsRes.data.accounts[0]?.account_id

    await BankAccount.findOneAndUpdate(
      { userId },
      { userId, plaidAccessToken: accessToken, accountId },
      { upsert: true, new: true }
    )

    res.json({ success: true })
  } catch (err) {
    console.error('plaid link error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

async function getTransactions(req, res) {
  try {
    const { userId } = req.query

    if (!userId) return res.status(400).json({ error: 'userId is required' })

    const bankAccount = await BankAccount.findOne({ userId })
    if (!bankAccount) return res.status(404).json({ error: 'No bank account linked' })

    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const txRes = await plaidClient.transactionsGet({
      access_token: bankAccount.plaidAccessToken,
      start_date: startDate,
      end_date: endDate
    })

    const transactions = txRes.data.transactions

    // Direct deposits: negative amounts (credits) over $200
    const directDeposits = transactions.filter(
      (tx) => tx.amount < -200
    )

    const lastDeposit = directDeposits.sort((a, b) => new Date(b.date) - new Date(a.date))[0]

    if (!lastDeposit) {
      return res.json({ lastPaycheck: null, change: null, payFrequency: null })
    }

    const lastPaycheck = Math.abs(lastDeposit.amount)

    // Change = cents leftover from paycheck amount
    const change = parseFloat((lastPaycheck % 1).toFixed(2))

    // Detect pay frequency from how many direct deposits in 30 days
    let payFrequency = 'unknown'
    if (directDeposits.length >= 4) payFrequency = 'weekly'
    else if (directDeposits.length >= 2) payFrequency = 'biweekly'
    else if (directDeposits.length === 1) payFrequency = 'monthly'

    await BankAccount.findOneAndUpdate({ userId }, { lastPaycheck, payFrequency })

    res.json({ lastPaycheck, change, payFrequency })
  } catch (err) {
    console.error('plaid transactions error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { linkAccount, getTransactions }
