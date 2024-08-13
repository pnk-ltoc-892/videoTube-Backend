import mongoose, { Schema } from "mongoose";


const subscriptionSchema = new Schema(
    {
        subscriber: { // One Who Is Subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: { // One to whom 'subscriber' is Subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)