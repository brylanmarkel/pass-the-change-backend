/**
 * Maps a charity document to the frontend contract.
 * Fields: id, name, category, description, image, supporterCount, color
 */
function toFrontendShape(doc) {
  if (!doc) return null
  const d = doc.toObject ? doc.toObject() : doc
  return {
    id: d._id?.toString?.() ?? d._id,
    _id: d._id,
    name: d.name,
    category: d.category ?? null,
    description: d.description ?? null,
    image: d.logoUrl ?? d.image ?? null,
    emoji: d.emoji ?? null,
    supporterCount: d.supporterCount ?? 0,
    color: d.color ?? null
  }
}

module.exports = { toFrontendShape }
