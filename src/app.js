
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

// app.use() - for configurations and middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,     // origin point of requests
    credentials: true
    // Explore more cors-Options
}))

app.use(express.json({  // Accept JSON data
    limit: "16kb"
    // Explore more Options
}))

// body-parser not needed nowadays in express

app.use(express.urlencoded({    // allow data from url
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))   // allow keeping assets

// CRUD operation on userBrowser cookies from server
app.use(cookieParser())


// Routes - Import
// userRouter is just router, imported with custom name
import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import commentRouter from './routes/comment.routes.js'

// Routes Declaration
// app.use("Using middleware to bring routes")

// Request At, "/api/v1/users/..." Redirected To userRouter
app.use("/api/v1/users", userRouter)  // Middleware


// Tweet Routes
app.use("/api/v1/tweets", tweetRouter)  

// Comment Routes
app.use("/api/v1/comments", commentRouter)




export { app }