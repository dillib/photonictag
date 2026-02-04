# AI & Automation Upgrade Plan (Adapt & Integrate)

## Goal
Enhance PhotonicTag with Event-Driven Automation (Trigger.dev) and RAG Capabilities (pgvector) without platform migration.

## 1. Data Layer: Vector Search (RAG)
**Objective:** Enable semantic search over products, batches, and documentation.

- [ ] **Database:** Enable `pgvector` extension on Railway Postgres.
- [ ] **Schema:** Create `embeddings` table (product_id, content, embedding vector).
- [ ] **Service:** `RAGService` to handle embedding generation (OpenAI text-embedding-3-small) and cosine similarity search.
- [ ] **Use Case:** "Where is Batch #402?" -> vector search -> context retrieval -> LLM answer.

## 2. Automation Layer: Trigger.dev
**Objective:** Move heavy/async tasks out of the main Express loop.

- [ ] **Integration:** Install `@trigger.dev/sdk` and `@trigger.dev/express`.
- [ ] **Setup:** Configure Trigger.dev project and API keys.
- [ ] **Job 1: SAP Sync:** Move the heavy SAP sync logic to a background job.
- [ ] **Job 2: Document Processing:** When a PDF is uploaded -> Extract data via LLM -> Update DB.

## 3. User Interface: AI Assistant
**Objective:** Smooth, efficient AI interaction.

- [ ] **UI:** Add "AI Copilot" floating chat widget.
- [ ] **API:** Stream responses to frontend (Vercel AI SDK works with Express too).
- [ ] **Feedback:** Capture user feedback on AI answers to improve vector quality.

## Implementation Steps
1. **Verification:** Check Railway Postgres version supports pgvector (usually yes for v15+).
2. **Setup:** Install dependencies (`pgvector`, `trigger.dev`, `langchain` or direct OpenAI).
3. **Migration:** Add vector tables.
4. **Code:** Implement `RAGService`.
5. **Code:** Implement Trigger.dev client.
6. **UI:** Build Chat Interface.

## Success Metrics
- Search returns relevant results for natural language queries.
- Heavy jobs (PDF parse) do not block the main UI.
- System scales to 10k+ concurrent jobs via Trigger.dev queue.
