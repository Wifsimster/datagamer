var mongoose = require('mongoose-q')(require('mongoose'));
var Schema = mongoose.Schema;

var GameSchema = new Schema({
    datagamer_id: Number,
    name: {
        type: String,
        trim: true
    },
    media: {
        boxArt: {
            front: String,
            rear: String
        },
        thumbnails: [String],
        logos: [String],
        banners: [String],
        fanArts: [String],
        screenshots: [String],
        trailers: [String]
    },
    editors: [{type: Schema.Types.ObjectId, ref: 'Editor'}],
    developers: [{type: Schema.Types.ObjectId, ref: 'Developer'}],
    genres: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
    platforms: [{type: Schema.Types.ObjectId, ref: 'Platform'}],
    overview: String,
    releaseDate: Date,
    creationDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: Date,
    metacritic: {
        score: Number,
        url: String
    },
    versions: [{number: String, date: Date}],
    snatched: false,
    downloaded: false
});

module.exports = mongoose.model('Game', GameSchema);