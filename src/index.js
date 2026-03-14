require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const usersRouter = require('./routes/users')
const plaidRouter = require('./routes/plaid')
const charitiesRouter = require('./routes/charities')
const donationsRouter = require('./routes/donations')
const impactRouter = require('./routes/impact')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/users', usersRouter)
app.use('/plaid', plaidRouter)
app.use('/charities', charitiesRouter)
app.use('/donations', donationsRouter)
app.use('/impact', impactRouter)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3000

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })
