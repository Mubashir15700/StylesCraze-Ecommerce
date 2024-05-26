import multer from "multer";
import sharp from "sharp";
import path from "path";
import { v4 } from "uuid";
import { __filename, __dirname } from "../utils/filePathUtil.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(err, false);
    }
};

const upload = multer({ storage, fileFilter });

export const uploadProductImages = upload.fields([
    {
        name: "images",
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
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(path.join(__dirname, "../public/uploads", "products", filename));

            req.body.images.push(filename);
        })
    );
    next();
};

export const uploadCategoryImage = upload.single("photo");

export const resizeCategoryImage = async (req, res, next) => {
    try {
        if (!req.file) return next();
        req.file.originalname = "category-" + v4() + "-" + ".png";
        req.body.photo = req.file.originalname;
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat("png")
            .png({ quality: 90 })
            .toFile(path.join(__dirname, "../public/uploads", "categories", req.file.originalname));
        next();

    } catch (error) {
        console.log(error.message);
    }
};

export const uploadProfileImage = upload.single("profile");

export const resizeProfileImage = async (req, res, next) => {
    try {
        if (!req.file) return next();
        req.file.originalname = "profile-" + v4() + "-" + ".png";
        req.body.profile = req.file.originalname;
        await sharp(req.file.buffer)
            .resize(200, 200)
            .toFormat("png")
            .png({ quality: 90 })
            .toFile(path.join(__dirname, "../public/uploads", "profiles", req.file.originalname));
        next();
    } catch (error) {
        console.log(error.message);
    }
};

export const uploadBannerImages = upload.fields([
    {
        name: "images",
        maxCount: 3
    }
]);

export const resizeBannerImages = async (req, res, next) => {
    if (!req.files.images) return next();
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file) => {
            const filename = `banner-${v4()}.jpeg`;
            await sharp(file.buffer)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(path.join(__dirname, "../public/uploads", "banners", filename));

            req.body.images.push(filename);
        })
    );
    next();
};
