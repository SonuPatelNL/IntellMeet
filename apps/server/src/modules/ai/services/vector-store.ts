export interface VectorDocument {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export class InMemoryVectorStore {
  private documents: Array<VectorDocument & { embedding?: number[] }> = [];

  add(document: VectorDocument, embedding?: number[]) {
    this.documents.push({ ...document, embedding });
  }

  search(query: string, limit = 5): Array<VectorDocument & { embedding?: number[] }> {
    const normalizedQuery = query.toLowerCase();
    return this.documents
      .filter((doc) => doc.text.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(doc.text.toLowerCase()))
      .slice(0, limit);
  }
}
