import axios from 'axios'


const baseURL = process.env.NEXT_PUBLIC_BASE_URI || (typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:8000/api/v1');

// eslint-disable-next-line no-console
console.info('[Axios] Base URL:', baseURL);

export const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[AxiosError]', error);
    return Promise.reject(error);
  }
);