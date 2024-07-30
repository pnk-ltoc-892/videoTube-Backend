# Setting Up Project

## Phase 1:
    - :npm init
    - : git init -> git add . -> git commit -> then connect to github
    - add public -> temp -> .gitkeep (Tracking)
    - gitignore -> .env, .env.sample
    - create src folder
    - : touch app.js   constants.js   index.js
    
    - : npm install --save-dev nodemon (as dev dependency)

    -  mkdir controllers db middlewares models routes utils

    - : npm i -D prettier
    - add pretitier configurations

## Phase 2: Connecting Database
    - update 'env' file with db url, and 'constants' with db name

    - get dot env package, mongoose, express
        - : npm i mongoose express dotenv
        - configure env in main index file
        - update packagejson as:
        - "scripts": {
                "dev": "nodemon '-r dotenv/config --experimental-json-modules' src/index.js"},
    
    - db/index.js -> write db connection code, and export the fn - connectDB
    - import and execute connectDB(), in main index file

    - In import statement, watch out 'extensions' .js in file names

## Phase 3: 
    - Inside app.js, create instance of express, and import it into index.js
    - Handle DB connection Promise, the start server by listening on PORT

    - Install few packages for middlewares
    - : npm i cookie-parser cors
    - configure these in app.js

    - Creating Wrapper Utilies Functions
        - asyncHandler, ApiError, ApiResponse
# JUst Try a git feture, editing this line of text in remoterepo in git hub to see if anything chages in local repositry

## Hello adding some text in remote repository

