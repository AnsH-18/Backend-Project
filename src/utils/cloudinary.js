import {v2 as cloudinary} from 'cloudinary';
import { response } from 'express';
import fs from "fs"
          
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

cloudinary.config({
    cloud_name: "drq7ygoyz",
    api_key: "678972762147439",
    api_secret: "yo9Dvc37rROJmsBFjmSOwV08nSs"
})

const uploadToCloudinary = async (localpath) => {
    if(!localpath) return null
    try {
        const response = await cloudinary.uploader.upload(localpath,{}, function(error, result) {});
        await fs.unlinkSync(localpath)
        return response
    } catch (error) {
        await fs.unlinkSync(localpath)
        console.log(error)
        return null
    }
}


export default uploadToCloudinary