
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async  (localFilePath) => {
  try {
    if(!localFilePath) return null

    //upload the file to cloudinary
 const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto",
    })

    //after upload
    console.log(response.url);
    return response;

  } catch (error) {

    //remove the locally saved file if it failed to upload
    fs.unlinkSync(localFilePath)
  }
}

export {uploadOnCloudinary};