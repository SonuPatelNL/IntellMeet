import { InMemoryVectorStore, VectorDocument } from './vector-store';
import { HashEmbeddingProvider } from './embeddings';

export class Retriever {
  constructor(
    private readonly store: InMemoryVectorStore = new InMemoryVectorStore(),
    private readonly embedder: HashEmbeddingProvider = new HashEmbeddingProvider()
  ) {}

  async add(document: VectorDocument) {
    const embedding = await this.embedder.embed(document.text);
    this.store.add(document, embedding);
  }

  async retrieve(query: string, limit = 5): Promise<VectorDocument[]> {
    const queryEmbedding = await this.embedder.embed(query);
    const results = this.store.search(query, limit);
    return results
      .map((doc) => ({
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding || []),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }

  private cosineSimilarity(left: number[], right: number[]): number {
    const dot = left.reduce((sum, value, index) => sum + value * (right[index] || 0), 0);
    const leftMagnitude = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
    const rightMagnitude = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
    return leftMagnitude && rightMagnitude ? dot / (leftMagnitude * rightMagnitude) : 0;
  }
}
