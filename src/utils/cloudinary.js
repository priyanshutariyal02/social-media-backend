import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // file-system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded successfully
    // console.log("File is uploaded successfully!", res.url);
    fs.unlinkSync(localFilePath); // after successfully upload in cloudinary the automatically remove from local path
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved tempary file as the upload option is failed
  }
};

export { uploadOnCloudinary };
