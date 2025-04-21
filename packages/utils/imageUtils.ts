// src/utils/imageUtils.ts
import imageCompression from "browser-image-compression";

/**
 * Converts a data URL string back into a File object.
 * @param dataUrl The data URL (e.g., "data:image/png;base64,...").
 * @param filename A desired filename for the resulting File object.
 * @returns A File object or null if conversion fails.
 */
function dataURLtoFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(",");
    if (!arr[0]) return null; // Invalid format

    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2) return null; // Cannot find mime type
    const mime = mimeMatch[1];

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    console.error("Error converting data URL to File:", error);
    return null;
  }
}

/**
 * Compresses an image represented by a data URL.
 * Uses browser-image-compression library.
 *
 * @param imageDataUrl The original image data URL (Base64 encoded).
 * @param options Optional compression options.
 * @returns A Promise resolving to the compressed image data URL (Base64 encoded),
 *          or the original URL if compression fails or isn't effective.
 */
export async function compressImage(
  imageDataUrl: string,
  options = {
    maxSizeMB: 0.5, // Max size in MB (adjust as needed)
    maxWidthOrHeight: 1024, // Max width or height (adjust as needed)
    useWebWorker: true, // Use web worker for better performance
    // initialQuality: 0.7, // Optional: Set initial quality
    // alwaysKeepResolution: false, // Allow resizing
  }
): Promise<string> {
  // Create a somewhat unique filename for the conversion
  const timestamp = Date.now();
  const filename = `image_${timestamp}.png`; // Assume png or let library handle type

  const imageFile = dataURLtoFile(imageDataUrl, filename);

  if (!imageFile) {
    console.warn(
      "Could not convert data URL to file for compression, returning original."
    );
    return imageDataUrl; // Return original if conversion failed
  }

  // Check if the original file is already smaller than the target size
  if (imageFile.size / 1024 / 1024 < options.maxSizeMB) {
    console.log("Image already small enough, skipping compression.");
    // Optional: Could still apply maxWidthOrHeight constraint if needed here
    // For simplicity, we skip if under size threshold.
    // return imageDataUrl; // Uncomment this line if you *only* want size reduction
  }

  console.log(
    `Original image size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
  );

  try {
    const compressedFile = await imageCompression(imageFile, options);
    console.log(
      `Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
    );

    // Convert the compressed File back to a data URL
    const compressedDataUrl =
      await imageCompression.getDataUrlFromFile(compressedFile);
    return compressedDataUrl;
  } catch (error) {
    console.error("Image compression failed:", error);
    // Fallback to original image data URL if compression fails
    return imageDataUrl;
  }
}
