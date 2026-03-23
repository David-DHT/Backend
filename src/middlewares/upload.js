import multer from 'multer';
import cloudinary from '../config/cloudinary.js';  

// Almacenamiento en memoria (no escribe archivos en disco)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('Formato no permitido. Solo se aceptan imágenes (jpg, jpeg, png, gif, webp)');
      error.status = 400;
      cb(error, false);
    }
  }
});

// Helper para subir a Cloudinary
const uploadToCloudinary = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'productos-uniccafe',
        resource_type: 'image',
        // Opcional: public_id: `producto-${Date.now()}-${file.originalname.split('.')[0]}`,
      },
      (error, result) => {
        if (error) {
          console.error('Error al subir imagen a Cloudinary:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
};

export {
  upload,
  uploadToCloudinary
};