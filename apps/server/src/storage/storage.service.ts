import { StorageProvider } from './index';
import { CloudinaryStorage } from './cloudinary';
import { LocalStorage } from './local';
import { S3Storage } from './s3';

export class StorageService {
  private provider: StorageProvider;

  constructor(provider?: StorageProvider) {
    this.provider = provider || this.resolveProvider();
  }

  private resolveProvider(): StorageProvider {
    const backend = process.env.STORAGE_BACKEND || 'local';
    if (backend === 'cloudinary') return new CloudinaryStorage();
    if (backend === 's3') return new S3Storage();
    return new LocalStorage();
  }

  async upload(fileBuffer: Buffer, options: { folder: string; filename?: string; contentType?: string }) {
    return this.provider.upload(fileBuffer, options);
  }

  async delete(key: string) {
    return this.provider.delete(key);
  }

  async getSignedUrl(key: string, expiresInSeconds?: number) {
    return this.provider.getSignedUrl(key, expiresInSeconds);
  }
}

export const storageService = new StorageService();
