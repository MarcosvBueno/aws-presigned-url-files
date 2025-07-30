import axios from 'axios';

type PresignedUrlResponse = {
  signedUrl: string;
  fileKey: string;
};

export async function getPresignedUrl(file: File) {
  const { data } = await axios.post<PresignedUrlResponse>(
    'https://klh52wtuwl7c4xsbkvxdnh2v3a0pgruo.lambda-url.us-east-1.on.aws/',
    {
      fileName: file.name,
    }
  );
  return data;
}
