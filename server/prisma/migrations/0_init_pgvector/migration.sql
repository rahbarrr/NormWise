-- Safe pgvector and Search Indexes Migration for NormWise
CREATE EXTENSION IF NOT EXISTS vector;

-- Embedding Index (HNSW for Cosine Distance Similarity)
CREATE INDEX IF NOT EXISTS standards_embedding_idx ON standards USING hnsw (embedding vector_cosine_ops);

-- GIN Inverted Indexes for High-Performance Structured and Full-Text Search
CREATE INDEX IF NOT EXISTS standards_keywords_idx ON standards USING gin (keywords);
CREATE INDEX IF NOT EXISTS standards_products_idx ON standards USING gin ("applicableProducts");
CREATE INDEX IF NOT EXISTS standards_materials_idx ON standards USING gin (materials);
CREATE INDEX IF NOT EXISTS standards_applications_idx ON standards USING gin (applications);
CREATE INDEX IF NOT EXISTS standards_fts_idx ON standards USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(scope, '')));
