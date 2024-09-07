import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        videoFile: {
            type: String, // Cloudinary url
            required: true
        },
        thumbnail: {
            type: String, // Cloudinary url
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        duration: {     // From cloudinary after uploading video Explore It...
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        dislikes: {
            type: Number,
            default: 0,
        },
        comments: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        }
        // See likes, dislike and other possible stuff
    },
    {
        timestamps: true
    }
)
// Explore entry that independently belongs to a particular video only 'no need of aggregation o other operartion'

videoSchema.plugin(mongooseAggregatePaginate)   // Allows Aggregation Queries

export const Video = mongoose.model("Video", videoSchema);