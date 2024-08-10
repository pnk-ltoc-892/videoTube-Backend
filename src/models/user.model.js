import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"; // Bearer Token
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        watchHistory: [{    // Array Storing Video-Object-Id
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true     // DB Searching - Optimization, :Explore It...
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,   // cloudinary url
            required: true,
        },
        coverimage: {
            type: String,   // cloudinary url
        },
        password: {
            type: String,
            required: [true, "Password Is Required"],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

// Explore mongoose plugins & Hooks

// 1. Normal fn (has this. CONTEXT access) | Arrow-Fn () => {} no context reference
// 2. "save" - event
// 3. 'this.SOMETHING' - has access to all User Fields
userSchema.pre("save", async function(next){    // execute before saving data Into DB
    // Only when passord is modified
    if(!this.isModified("password")) return next(); // negation check
    // Hash The Updated Password
    this.password = await bcrypt.hash(this.password, 10); // 10 - hash rounds
    next();       // await important 
})  


// custom mongodb method injected in Schema
userSchema.methods.isPasswordCorrect = async function(password){
    //                     user-entered, hashed-password in DB 
    return await bcrypt.compare(password, this.password)    // boolean Value
}

// Not Stored In Database, Holds More Information
userSchema.methods.generateAccessToken = function(){
    // Generate Token
    return jwt.sign(       // fast process no async-await
        {   // payloads : data from database
                    _id: this._id,
                    email: this.email,
                    username: this.username,
                    fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }   
    )                   
}               

// Stored In Database, Holds Less Information
userSchema.methods.generateRefreshToken = function(){
    // Generate Token
    return jwt.sign(   
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 


export const User = mongoose.model("User", userSchema);