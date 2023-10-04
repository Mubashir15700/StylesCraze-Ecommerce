import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Banner from '../../models/bannerModel.js';
import { newProductErrorPage, editProductErrorPage } from '../../middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getBanners = async (req, res, next) => {
    try {
        const foundBanners = await Banner.find();
        res.render('admin/banner/banners', { 
            foundBanners,
            activePage: 'Banner' 
        });
    } catch (error) {
        next(error);
    }
};

export const getAddNewBanner = async (req, res, next) => {
    try {
        res.render('admin/banner/newBanner', { 
            error: '',
            activePage: 'Banner' 
        });
    } catch (error) {
        next(error);
    }
};

export const addNewBanner = async (req, res, next) => {
    try {
        const { title, description, images } = req.body;
        if (!title || !description || !images) {
            res.render('admin/banner/newBanner', {
                error: "All fields are required.",
                activePage: 'Banner'
            });
        } else {
            const imagesWithPath = images.map(img => '/banners/' + img);

            await Banner.create({
                title,
                description,
                images: imagesWithPath,
            });
        }
        res.redirect('/admin/banners');
    } catch (error) {
        next(error);
    }
};

export const getBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        res.render('admin/banner/editBanner', { 
            banner, 
            error: '',
            activePage: 'Banner' 
        });
    } catch (error) {
        next(error);
    }
};

export const editBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        const { title, description } = req.body;
        if (!title || !description) {
            res.render('admin/banner/editBanner', { 
                banner, 
                error: 'All fields are required.',
                activePage: 'Banner'
            });
        } else {
            banner.title = title;
            banner.description = description;
            await banner.save();
            res.redirect('/admin/banners');
        }
    } catch (error) {
        next(error);
    }
};

// causing an error
export const deleteBannerImage = async (req, res, next) => {
    const { id } = req.params;
    const { image } = req.body;
    try {
        await Banner.findByIdAndUpdate(id, { $pull: { images: image } }, { new: true });

        fs.unlink(path.join(__dirname, '../public', image), (err) => {
            if (err) console.log(err);
        });

        res.redirect(`/admin/edit-banner/${id}`);
    } catch (error) {
        next(error);
    }
};

export const addBannerImage = async (req, res, next) => {
    const { id } = req.params;
    const { images } = req.body;
    let imagesWithPath;
    if (images && images.length) {
        imagesWithPath = images.map(image => '/banners/' + image);
    }
    try {
        await Banner.findByIdAndUpdate(id, { $push: { images: imagesWithPath } }, { new: true });
        res.redirect(`/admin/edit-banner/${id}`);
    } catch (error) {
        next(error);
    }
};

export const bannerAction = async (req, res, next) => {
    try {
        const state = req.body.state === "1";
        if (state) {
            await Banner.findOneAndUpdate({ isActive: true }, { $set: { isActive: false } });
        }
        await Banner.findByIdAndUpdate(req.params.id, { $set: { isActive: state } });
        res.redirect('/admin/banners');   
    } catch (error) {
        next(error);
    }
};