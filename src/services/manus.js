async function triggerAgent(donateUrl, amount) {
  fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'API_KEY': process.env.MANUS_API_KEY
    },
    body: JSON.stringify({
      prompt: `Go to ${donateUrl}, find the donation form, enter $${amount}, fill in payment details, and submit.`
    })
  }).catch((err) => console.error('Manus agent error:', err.message))
  // no await — fire and forget
}

module.exports = { triggerAgent }
