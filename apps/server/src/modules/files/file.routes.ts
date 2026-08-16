import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import { storageService } from '../../storage/storage.service';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

function createError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file provided', 400);
    }

    const folder = (req.body.folder as string) || 'intellmeet/files';
    const filename = (req.body.filename as string) || req.file.originalname;
    const contentType = req.file.mimetype;

    const result = await storageService.upload(req.file.buffer, { folder, filename, contentType });
    const signedUrl = await storageService.getSignedUrl(result.key, 3600);

    res.status(201).json({
      status: 'success',
      data: {
        url: result.url,
        key: result.key,
        signedUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/delete', requireAuth, async (req, res, next) => {
  try {
    const { key } = req.body as { key?: string };
    if (!key) {
      throw createError('File key is required', 400);
    }

    await storageService.delete(key);

    res.status(200).json({
      status: 'success',
      data: { deleted: true, key },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/signed-url', requireAuth, async (req, res, next) => {
  try {
    const { key, expiresInSeconds } = req.body as { key?: string; expiresInSeconds?: number };
    if (!key) {
      throw createError('File key is required', 400);
    }

    const signedUrl = await storageService.getSignedUrl(key, expiresInSeconds);

    res.status(200).json({
      status: 'success',
      data: { signedUrl },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
