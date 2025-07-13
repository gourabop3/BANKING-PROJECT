"use client";
import { useEffect, useState } from 'react';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';
import HeaderName from '@/components/HeaderName';

export default function KYCPage() {
  const { user, fetchUserProfile } = useMainContext();
  const [form, setForm] = useState({
    name: '',
    address: '',
    mobileNumber: '',
    aadhaarNumber: '',
    panNumber: '',
    aadhaarImage: null,
    panImage: null,
  });
  const [preview, setPreview] = useState({ aadhaarImage: '', panImage: '' });
  const [loading, setLoading] = useState(false);
  const [statusObj, setStatusObj] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosClient.get('/kyc/status', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        });
        setStatusObj(await res.data);
      } catch (error) {
        // ignore if no application
      }
    };
    fetchStatus();
  }, []);

  const handleFile = (name) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, [name]: reader.result }));
      setPreview((prev) => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      // Submit KYC application (OTP no longer required)
      await axiosClient.post('/kyc/apply', form, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      toast.success('KYC application submitted');
      await fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = user?.kyc_status || 'not_submitted';

  return (
    <div className="container py-10 flex flex-col items-center">
      <HeaderName />
      <h2 className="text-2xl font-bold mb-4">KYC Verification</h2>
      <p className="mb-4">Current status: <span className="font-semibold capitalize">{currentStatus}</span></p>
      {currentStatus === 'verified' && <p className="text-green-600">Your KYC is verified.</p>}
      {currentStatus === 'pending' && <p className="text-amber-600">Your application is pending review.</p>}
      {currentStatus === 'rejected' && <p className="text-red-600">Your KYC was rejected. Please re-apply.</p>}

      {(currentStatus === 'not_submitted' || currentStatus === 'rejected') && (
        <form onSubmit={onSubmit} className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8 mt-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Submit KYC Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700">Full Name</label>
              <input name="name" value={form.name} onChange={onChange} required className="w-full px-3 py-2 border rounded focus:ring-rose-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-gray-700">Address</label>
              <textarea name="address" value={form.address} onChange={onChange} required className="w-full px-3 py-2 border rounded focus:ring-rose-500" rows="2" />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Mobile Number</label>
              <input name="mobileNumber" value={form.mobileNumber} onChange={onChange} required maxLength={15} className="w-full px-3 py-2 border rounded focus:ring-rose-500" />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Aadhaar Number</label>
              <input name="aadhaarNumber" value={form.aadhaarNumber} onChange={onChange} required maxLength={12} className="w-full px-3 py-2 border rounded focus:ring-rose-500" />
            </div>

            <div>
              <label className="block mb-1 text-gray-700">PAN Number</label>
              <input name="panNumber" value={form.panNumber} onChange={onChange} required maxLength={10} className="w-full px-3 py-2 border rounded focus:ring-rose-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-gray-700">Aadhaar Image</label>
              <input type="file" accept="image/*" onChange={handleFile('aadhaarImage')} required className="mb-2" />
              {preview.aadhaarImage && <img src={preview.aadhaarImage} alt="aadhaar" className="h-40 object-contain border rounded" />}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-gray-700">PAN Image</label>
              <input type="file" accept="image/*" onChange={handleFile('panImage')} required className="mb-2" />
              {preview.panImage && <img src={preview.panImage} alt="pan" className="h-40 object-contain border rounded" />}
            </div>
          </div>
          <button disabled={loading} className="bg-rose-600 hover:bg-rose-700 transition-colors text-white px-6 py-2 rounded disabled:bg-rose-300 font-semibold shadow">
            {loading ? 'Submitting…' : 'Submit KYC'}
          </button>
        </form>
      )}
    </div>
  );
}