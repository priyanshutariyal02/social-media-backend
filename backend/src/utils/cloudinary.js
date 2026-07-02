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
    console.error("Cloudinary upload failed:", error?.message || error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // remove the locally saved temporary file
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicIdOrUrl, resourceType = "image") => {
  try {
    if (!publicIdOrUrl) {
      return null;
    }
    // Extract publicId if a full Cloudinary URL is provided
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.startsWith("http")) {
      const parts = publicIdOrUrl.split("/");
      const filename = parts.pop();
      const idWithoutExtension = filename.split(".")[0];
      publicId = idWithoutExtension;
    }
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return res;
  } catch (error) {
    console.error("Cloudinary deletion failed:", error?.message || error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
