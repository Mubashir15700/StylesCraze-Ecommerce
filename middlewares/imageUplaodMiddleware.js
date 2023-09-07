import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { v4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Determine the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(err, false);
    }
};

const upload = multer({ storage, fileFilter });

export const uploadProductImages = upload.fields([
    {
        name: 'images',
        maxCount: 3
    }
]);

export const resizeProductImages = async (req, res, next) => {
    if (!req.files.images) return next();
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file) => {
            const filename = `product-${v4()}.jpeg`;
            await sharp(file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(path.join(__dirname, '../public', 'products', filename));

            req.body.images.push(filename);
        })
    );
    next();
};

export const uploadCategoryImage = upload.single('photo');

export const resizeCategoryImage = async (req, res, next) => {
    try {
        if (!req.file) return next();
        req.file.originalname = 'category-' + v4() + '-' + '.png';
        req.body.photo = req.file.originalname;
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('png')
            .png({ quality: 90 })
            .toFile(path.join(__dirname, '../public', 'categories', req.file.originalname));

        next();

    } catch (error) {
        console.log(error.message);
    }
};