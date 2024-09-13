import axios from "axios";

export const uploadImage = async (img) => {
  let imgUrl = null;

  try {
    // Step 1: Get a pre-signed upload URL from your server
    const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`);
    const uploadURL = response.data.uploadURL;

    // Step 2: Upload the image using the pre-signed URL
    await axios.put(uploadURL, img, {
      headers: {
        "Content-Type": img.type,  // Set to the correct content type of the image
      },
    });

    // Extract the image URL (excluding query parameters)
    imgUrl = uploadURL.split('?')[0];
  } catch (error) {
    console.error("Error uploading image:", error.message);
  }

  return imgUrl;
};
