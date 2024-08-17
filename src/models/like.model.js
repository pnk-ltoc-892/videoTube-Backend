import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Where Pagination Is Used & Where Not ???

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedby: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {timestamps: true}
)

// likeSchema.plugin(mongooseAggregatePaginate)   // Allows Aggregation Queries

export const Like = mongoose.model("Like", likeSchema)