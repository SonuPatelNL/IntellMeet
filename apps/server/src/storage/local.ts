import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { StorageProvider } from './index';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

export class LocalStorage implements StorageProvider {
  constructor(private readonly baseDir = path.join(process.cwd(), 'uploads')) {}

  async upload(fileBuffer: Buffer, options: { folder: string; filename?: string; contentType?: string }): Promise<{ url: string; key: string }> {
    await mkdir(path.join(this.baseDir, options.folder), { recursive: true });
    const filename = options.filename || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const filePath = path.join(this.baseDir, options.folder, filename);
    await writeFile(filePath, fileBuffer);
    return { url: `/uploads/${options.folder}/${filename}`, key: `${options.folder}/${filename}` };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    await unlink(filePath).catch(() => undefined);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `${this.baseDir}/${key}?expires=${expiresInSeconds}`;
  }
}
