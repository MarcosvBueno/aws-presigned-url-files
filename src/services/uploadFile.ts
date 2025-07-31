import axios from 'axios';

export async function uploadFile(
  file: File,
  url: string,
  onProgress?: (progress: number) => void
) {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: ({ total, loaded }) => {
      const percentage = Math.round((loaded * 100) / (total ?? 0));
      onProgress?.(percentage);
    },
  });
}
