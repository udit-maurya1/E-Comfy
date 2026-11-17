import ImageKit from "@imagekit/nodejs";
import config from "../config/config.js";

const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY, // This is the default and can be omitted
});

export async function uploadImage(buffer, fileName, folder = "ecomfy") {
  try {
    const uploadResult = await client.files.upload({
      file: await ImageKit.toFile(buffer),
      fileName: fileName,
      folder: folder,
    });
    return uploadResult;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
