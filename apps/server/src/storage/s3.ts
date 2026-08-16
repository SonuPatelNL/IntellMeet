import { StorageProvider } from './index';

export class S3Storage implements StorageProvider {
  async upload(fileBuffer: Buffer, options: { folder: string; filename?: string; contentType?: string }): Promise<{ url: string; key: string }> {
    const key = `${options.folder}/${options.filename || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
    return { url: `s3://mock/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    return undefined;
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `https://example.s3.amazonaws.com/${key}?X-Amz-Expires=${expiresInSeconds}`;
  }
}
