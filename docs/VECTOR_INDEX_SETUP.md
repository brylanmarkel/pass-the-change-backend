# MongoDB Atlas Vector Index Setup

Step-by-step guide to set up vector search for charities.

---

## Step 1: Add embeddings to charities

Your charity documents need an `embedding` field (array of numbers). Run:

```bash
# Add OPENAI_API_KEY to .env first, then:
node seed/embed-charities.js
```

This calls OpenAI's `text-embedding-3-small` model and stores 1536-dimension vectors in each charity document.

---

## Step 2: Create the vector index in Atlas

1. In MongoDB Atlas, go to **Search & Vector Search** (left sidebar under DATABASE).
2. Click **Create Search Index**.
3. **Search type:** Select **Vector Search** (not "search"). If you pick "search", the JSON editor will reject the definition with "Property fields is not allowed."
4. **Index name:** `charity_embeddings`
5. **Database and collection:** Select your database (e.g. `test`) and the `charities` collection.
6. **Configuration method:** Choose **JSON Editor**.
7. Paste this definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "category"
    }
  ]
}
```

8. Click **Create Search Index**.
9. Wait for the index to finish building (status: Ready, queryable: true).

---

## Step 3: Verify

In Atlas, open a charity document. It should have an `embedding` field with an array of 1536 numbers.

---

## Optional: Use vector search in your app

To query by semantic similarity (e.g. user's text → top matching charities), use `$vectorSearch` in an aggregation:

```javascript
const results = await Charity.aggregate([
  {
    $vectorSearch: {
      index: 'charity_embeddings',
      path: 'embedding',
      queryVector: userQueryEmbedding,  // 1536-dim array from OpenAI
      numCandidates: 20,
      limit: 3
    }
  }
])
```

You’d need to generate `userQueryEmbedding` from the user’s input (e.g. onboarding answers) using the same OpenAI embedding model.
