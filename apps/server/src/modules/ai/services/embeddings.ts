export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class HashEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const tokens = text.toLowerCase().trim().split(/[^a-z0-9]+/).filter(Boolean);
    const vector = new Array(32).fill(0);
    tokens.forEach((token, index) => {
      const code = token.charCodeAt(0) || 97;
      const slot = (code + index) % vector.length;
      vector[slot] += 1;
    });
    return vector.map((value) => Number(value.toFixed(4)));
  }
}
