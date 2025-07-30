import axios from 'axios';

export async function uploadFile(file: File, url: string) {
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
}
