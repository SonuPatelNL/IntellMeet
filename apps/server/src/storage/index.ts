export interface StorageProvider {
  upload(fileBuffer: Buffer, options: { folder: string; filename?: string; contentType?: string }): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export interface UploadResult {
  url: string;
  key: string;
}
