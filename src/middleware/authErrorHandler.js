/**
 * Catches auth errors from Clerk (e.g. requireAuth) and returns 401/403 instead of 500.
 * Must be registered after routes.
 */
function authErrorHandler(err, req, res, next) {
  if (res.headersSent) return next(err)

  const msg = (err.message || '').toLowerCase()
  const isAuthError =
    msg.includes('unauthenticated') ||
    msg.includes('unauthorized') ||
    msg.includes('invalid token') ||
    msg.includes('jwt') ||
    err.status === 401 ||
    err.status === 403

  if (isAuthError) {
    return res.status(err.status === 403 ? 403 : 401).json({ error: 'Unauthorized' })
  }

  next(err)
}

module.exports = { authErrorHandler }
