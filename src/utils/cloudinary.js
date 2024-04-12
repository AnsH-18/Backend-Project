import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadToCloudinary = async (localpath) => {
    if(!localpath) return null
    try {
        const rresponse = await cloudinary.uploader.upload(localpath,{}, function(error, result) {console.log(result); });
        console.log(response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localpath)
        console.log(error)
        return null
    }
}


export default uploadToCloudinary