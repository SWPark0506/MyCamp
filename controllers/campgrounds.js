const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    const toggle = false;
    res.render('campgrounds/index', { campgrounds, toggle });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.searchCampground = async (req, res, next) => {
    const title = req.body.search;
    const regex = new RegExp(title, 'i'); // 'i' 옵션은 대소문자를 구분하지 않도록 합니다.
    const toggle = true;

    const campgrounds = await Campground.find({ title: regex });
    res.render('campgrounds/index', { campgrounds, toggle, title })


}

module.exports.showCampground = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', '해당 캠핑장을 찾을 수 없습니다!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;

    const date = new Date();
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

    campground.date = dateString;
    await campground.save();
    req.flash('success', '새로운 캠핑장을 성공적으로 만들었습니다!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', '해당 캠핑장을 찾을 수 없습니다!')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    campground.geometry = geoData.body.features[0].geometry;

    const date = new Date();
    const dateString = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    campground.date = dateString;

    await campground.save()
    if (req.body.deleteImages) {

        if (req.body.deleteImages.length === campground.images.length) {
            req.flash('error', '캠핑장은 적어도 1개의 이미지가 필요합니다!')
            res.redirect(`/campgrounds/${campground._id}/edit`)

        } else {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
            req.flash('success', '캠핑장이 성공적으로 업데이트되었습니다!')
            res.redirect(`/campgrounds/${campground._id}`)
        }

    }
    else {
        req.flash('success', '캠핑장이 성공적으로 업데이트되었습니다!')
        res.redirect(`/campgrounds/${campground._id}`)
    }


}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    for (img of campground.images) {
        await cloudinary.uploader.destroy(img.filename);
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', '캠핑장이 성공적으로 삭제되었습니다')
    res.redirect('/campgrounds')
} 