import { storage } from "./firebase"; // Adjust the import path to your Firebase config
import {
  ref,
  uploadBytes,
  getDownloadURL,
  StorageError,
} from "firebase/storage";
import imageCompression from "browser-image-compression";

// Compression options updated for 600 KB target
const compressionOptions = {
  maxSizeMB: 0.6,         // Target maximum file size of 600 KB (0.6 MB)
  maxWidthOrHeight: 1920, // Maximum dimension in pixels
  useWebWorker: true,     // Use web worker for better performance
  fileType: "image/jpeg", // Convert to JPEG for consistency
  initialQuality: 0.8,    // Start with 80% quality (adjustable)
};

export async function uploadImage(file, path) {
  console.log("Original file:", file, "path:", path);
  console.log("Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");

  try {
    // Compress the image to approximately 600 KB
    console.log("Starting image compression to ~600 KB...");
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log("Compressed file size:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the compressed file
    console.log("Uploading compressed image...");
    const snapshot = await uploadBytes(storageRef, compressedFile);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Upload successful, URL:", downloadURL);

    return {
      success: true,
      url: downloadURL,
    };
  } catch (error) {
    let errorMessage = "Failed to upload image";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error details:", error);
    }

    if (error instanceof StorageError) {
      console.error("Firebase Storage Error:", error.message);
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Example usage:
/*
async function example() {
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput.files?.[0]) {
    const result = await uploadImage(fileInput.files[0], "images/example.jpg");
    if (result.success) {
      console.log("Image uploaded successfully:", result.url);
    } else {
      console.error("Upload failed:", result.error);
    }
  }
}
*/
