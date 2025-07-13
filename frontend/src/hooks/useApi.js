import { useState } from 'react';
import { toast } from 'react-toastify';
import { axiosClient } from '@/utils/AxiosClient';

/**
 * Example:
 * const { loading, request } = useApi();
 * await request(() => axiosClient.get('/users'));
 */
export default function useApi() {
  const [loading, setLoading] = useState(false);

  const request = async (fn, { successMsg } = {}) => {
    try {
      setLoading(true);
      const res = await fn();
      if (successMsg) toast.success(successMsg);
      return res;
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, request };
}