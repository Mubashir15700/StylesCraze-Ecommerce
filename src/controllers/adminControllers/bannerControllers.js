import fs from "fs";
import path from "path";
import Banner from "../../models/bannerModel.js";
import { __filename, __dirname } from "../../utils/filePathUtil.js";
import catchAsync from "../../utils/catchAsyncUtil.js";

export const getBanners = catchAsync(async (req, res, next) => {
    // pagination
    const page = parseInt(req.params.page) || 1;
    const pageSize = 3;
    const skip = (page - 1) * pageSize;
    const totalBanners = await Banner.countDocuments();
    const totalPages = Math.ceil(totalBanners / pageSize);

    let foundBanners;
    if (req.query.search) {
        foundBanners = await Banner.find({
            $or: [
                { title: { $regex: req.body.searchQuery, $options: "i" } }
            ]
        });
        return res.status(200).json({
            bannerDatas: foundBanners,
        });
    } else {
        foundBanners = await Banner.find().skip(skip).limit(pageSize);
    }
    res.render("admin/banner/banners", {
        foundBanners,
        activePage: "Banner",
        filtered: req.query.search ? true : false,
        currentPage: page || 1,
        totalPages: totalPages || 1,
    });
});

export const getAddNewBanner = catchAsync(async (req, res, next) => {
    res.render("admin/banner/newBanner", {
        error: "",
        activePage: "Banner"
    });
});

export const addNewBanner = catchAsync(async (req, res, next) => {
    const { title, description, images } = req.body;
    if (!title || !description || !images) {
        res.render("admin/banner/newBanner", {
            error: "All fields are required.",
            activePage: "Banner"
        });
    } else if (description.length > 100) {
        res.render("admin/banner/newBanner", {
            error: "Description should be less than or equal to 100 characters.",
            activePage: "Banner"
        });
    } else {
        const imagesWithPath = images.map(img => "/banners/" + img);
        await Banner.create({
            title,
            description,
            images: imagesWithPath,
        });
    }
    res.redirect("/admin/banners/1");
});

export const getBanner = catchAsync(async (req, res, next) => {
    const banner = await Banner.findById(req.params.id);
    res.render("admin/banner/editBanner", {
        banner,
        error: "",
        activePage: "Banner"
    });
});

export const editBanner = catchAsync(async (req, res, next) => {
    const banner = await Banner.findById(req.params.id);
    const { title, description } = req.body;
    if (!title || !description) {
        res.render("admin/banner/editBanner", {
            banner,
            error: "All fields are required.",
            activePage: "Banner"
        });
    } else if (description.length > 100) {
        res.render("admin/banner/editBanner", {
            banner,
            error: "Description should be less than or equal to 100 characters.",
            activePage: "Banner"
        });
    } else {
        banner.title = title;
        banner.description = description;
        await banner.save();
        res.redirect("/admin/banners/1");
    }
});

export const deleteBannerImage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { image } = req.body;

    await Banner.findByIdAndUpdate(id, { $pull: { images: image } }, { new: true });

    // Construct the full path to the image file
    const imagePath = path.join(__dirname, "../../public/uploads", image);

    // Check if the image file exists
    if (fs.existsSync(imagePath)) {
        fs.unlink(path.join(__dirname, "../../public/uploads", image), (err) => {
            if (err) {
                throw err;
            }
        });
    }

    res.redirect(`/admin/banners/${id}/edit`);
});

export const addBannerImage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { images } = req.body;
    let imagesWithPath;
    if (images && images.length) {
        imagesWithPath = images.map(image => "/banners/" + image);
    }
    await Banner.findByIdAndUpdate(id, { $push: { images: imagesWithPath } }, { new: true });
    res.redirect(`/admin/banners/${id}/edit`);
});

export const bannerAction = catchAsync(async (req, res, next) => {
    const state = req.body.state === "1";
    if (state) {
        await Banner.findOneAndUpdate({ isActive: true }, { $set: { isActive: false } });
    }
    await Banner.findByIdAndUpdate(req.params.id, { $set: { isActive: state } });
    res.redirect("/admin/banners/1");
});
