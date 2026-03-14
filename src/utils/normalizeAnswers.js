function normalizeAnswers(onboardingAnswers) {
  if (!onboardingAnswers) return []
  if (Array.isArray(onboardingAnswers)) return onboardingAnswers
  if (typeof onboardingAnswers === 'object') return Object.values(onboardingAnswers)
  return []
}

module.exports = { normalizeAnswers }
