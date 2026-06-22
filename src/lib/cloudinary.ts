import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string,
  publicId?: string
) {
  return cloudinary.uploader.upload(file as string, {
    folder: `seva-foundation/${folder}`,
    public_id: publicId,
    resource_type: "auto",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
}

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
