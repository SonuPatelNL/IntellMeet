import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import { StorageProvider } from './index';

export class CloudinaryStorage implements StorageProvider {
  async upload(fileBuffer: Buffer, options: { folder: string; filename?: string; contentType?: string }): Promise<{ url: string; key: string }> {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.filename,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });

    return { url: result.secure_url, key: result.public_id };
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return cloudinary.url(key, { sign_url: true, expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds });
  }
}
