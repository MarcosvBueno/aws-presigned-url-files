import axios from 'axios';

type PresignedUrlResponse = {
  signedUrl: string;
  fileKey: string;
};



const lambdaUrl = import.meta.env.VITE_LAMBDA_URL;

export async function getPresignedUrl(file: File) {
  const { data } = await axios.post<PresignedUrlResponse>(lambdaUrl, {
    fileName: file.name,
  });
  return data;
}
