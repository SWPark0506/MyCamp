const mongoose = require('mongoose');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers')
const cities = require('./cities');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '65e81ffe1e9a920df835f708',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut vitae consectetur ad perferendis voluptate aliquid laudantium non enim, quia fugiat hic voluptas error, nobis ipsam explicabo aspernatur quo amet maxime?',
            price: price,
            geometry: {
                'type': 'Point',
                'coordinates': [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]

            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dgirwgezz/image/upload/v1710313902/YelpCamp/btanitzniupuzfwzntgr.jpg',
                    filename: 'YelpCamp/btanitzniupuzfwzntgr',

                },
                {
                    url: 'https://res.cloudinary.com/dgirwgezz/image/upload/v1710313904/YelpCamp/xriijgn6led5jvvcfney.jpg',
                    filename: 'YelpCamp/xriijgn6led5jvvcfney',

                }
            ]
        });
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})
