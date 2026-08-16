import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import { updateProfileSchema, changePasswordSchema } from './user.validation';
import { getProfile, updateProfile, changePassword, uploadAvatar, deleteAccount } from './user.controller';

const router = Router();

// Configure multer for memory storage (we upload buffer directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// All user routes require authentication
router.use(requireAuth);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);
router.patch('/me/password', validate(changePasswordSchema), changePassword);
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/me', deleteAccount);

export default router;
