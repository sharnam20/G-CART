import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Only create 'uploads' folder in local (not on Vercel)
const uploadsDir = 'uploads';
if (process.env.VERCEL !== '1') {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
}

// ✅ Use memory storage on Vercel (no disk allowed)
const storage = process.env.VERCEL === '1'
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadsDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
      }
    });

// ✅ File type check
const fileFilter = (req, file, cb) => {
  console.log('File filter check:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'), false);
    }
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// ✅ Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB.' });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files. Max 10 allowed.' });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, message: 'Unexpected field name. Use "images".' });
    }

    return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
  }

  if (err) {
    console.error('File filter error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Max 10 files
    fieldSize: 100 * 1024 * 1024 // 100MB total
  },
  fileFilter
});

export { handleMulterError };
