import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Upload the file
const UploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null; // also return a message
        const uploadResponse = await cloudinary.uploader.upload(localfilepath, {  // explore other options
            resource_type: "auto"
        })
        // file has been uploaded succesfully
        console.log("File Uploaded Succesfully On Cloudinary");
        // console.log(uploadResponse.); log it and see 
        
        // ! Delete File After Succesfully uploaded - Done
        fs.unlinkSync(localfilepath);

        return uploadResponse;
        
    } catch (error) {
        // remove the locally saved temporary file, due to upload failure
        fs.unlinkSync(localfilepath);
        console.log("Error While Uploading On Cloudinary: ", error);
        return null;
    }
}

export { UploadOnCloudinary }