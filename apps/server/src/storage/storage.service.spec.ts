import { StorageService } from './storage.service';

describe('StorageService', () => {
  it('delegates upload, delete and signed URL operations to the configured provider', async () => {
    const provider = {
      upload: jest.fn().mockResolvedValue({ url: 'https://cdn.example.com/file.png', key: 'avatars/file.png' }),
      delete: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue('https://cdn.example.com/file.png?sig=abc123'),
    };

    const service = new StorageService(provider as any);

    await expect(service.upload(Buffer.from('file'), { folder: 'avatars', filename: 'file.png' })).resolves.toEqual({
      url: 'https://cdn.example.com/file.png',
      key: 'avatars/file.png',
    });
    await expect(service.delete('avatars/file.png')).resolves.toBeUndefined();
    await expect(service.getSignedUrl('avatars/file.png', 1200)).resolves.toBe('https://cdn.example.com/file.png?sig=abc123');

    expect(provider.upload).toHaveBeenCalledWith(Buffer.from('file'), { folder: 'avatars', filename: 'file.png' });
    expect(provider.delete).toHaveBeenCalledWith('avatars/file.png');
    expect(provider.getSignedUrl).toHaveBeenCalledWith('avatars/file.png', 1200);
  });
});
