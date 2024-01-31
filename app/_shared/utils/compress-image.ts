import Compressor from 'compressorjs';

export const compressImage = (
  blob: Blob,
  height: number,
  width: number,
  quality: number
): Promise<Blob | File> => {
  return new Promise((resolve, reject) => {
    new Compressor(blob, {
      height: height,
      width: width,
      quality: quality,
      resize: 'cover',
      mimeType: 'image/webp',
      success: async (result) => {
        resolve(result);
      },
      error(err) {
        console.log(err.message);
        reject(err);
      },
    });
  });
};
