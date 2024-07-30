
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




export { app }