# Database Schema Notes

This project uses **MongoDB + Mongoose** with multi-tenant isolation by `tenantId` in each collection.

## Collections
- `tenants`: account, chatbot settings, billing metadata, usage counters.
- `knowledgedocuments`: uploaded FAQ/text/pdf content and embedding chunks.
- `chatsessions`: full conversation history with role-tagged messages.
- `leads`: lead capture records from widget conversations.

## RAG Strategy
Each knowledge document is split into chunks and embedded using `text-embedding-3-small`. During chat, relevant chunks are selected by cosine similarity and appended as context for the GPT completion.
