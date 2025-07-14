"use client";
import React, { useEffect, useRef, useState } from 'react'
import { CiCamera } from "react-icons/ci";
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as yup from 'yup'
import { toast } from 'react-toastify';
import { onlyInputNumber } from '@/utils/constant';
import CustomAuthButton from '@/components/reuseable/CustomAuthButton';
import VerifiedEMailModel from './+__(components)/VerifiedEMailModel';
import { useMainContext } from '@/context/MainContext';
import { CgSpinner } from 'react-icons/cg';
import { axiosClient } from '@/utils/AxiosClient';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaEdit, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaCreditCard,
  FaShieldAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaChartLine,
  FaCog,
  FaLock,
  FaBell,
  FaDownload,
  FaEye,
  FaStar,
  FaCoins,
  FaHistory
} from 'react-icons/fa';
import { MdVerified, MdPending, MdError, MdAccountBalance, MdSecurity } from 'react-icons/md';
import HeaderName from '@/components/HeaderName';
import { Tab } from '@headlessui/react';

const ProfilePage = () => {
  const { user, fetchUserProfile } = useMainContext()
  const [loader, setLoader] = useState(false)
  const [image, setImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const imageRef = useRef(null)
  const [tabIndex, setTabIndex] = useState(0);
  // Security tab state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);
  // Preferences tab state
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('notifications') !== 'false');

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Notifications toggle persistence
  useEffect(() => {
    localStorage.setItem('notifications', notifications);
  }, [notifications]);

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await axiosClient.post('/auth/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      setPasswordMsg({ type: 'success', text: res.data.msg || 'Password changed successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const validationSchema = yup.object({
    name: yup.string().required("Name is Required"),
    bio: yup.string(),
    mobile_no: yup.string().required("Mobile No is Required").min(10, "Mobile No should be equal to 10 digits").max(10, "Mobile No should be equal to 10 digits")
  })

  const onSubmitHandler = async (values, { resetForm }) => {
    try {
      setLoader(true)
      const response = await axiosClient.post('/auth/update-basic-details', values, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        }
      })
      const data = await response.data
      toast.success(data.msg)
      fetchUserProfile()
    } catch (error) {
      toast.error(error.response.data.msg || error.message)
    } finally {
      setLoader(false)
    }
  }

  const onFilePickHandler = (e) => {
    e.preventDefault()
    imageRef.current.click()
  }

  const updateImageAvatar = async () => {
    try {
      setImageLoading(true)
      const formData = new FormData()
      formData.append("avatar", image)
      const response = await axiosClient.post('/auth/update-avatar', formData, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        }
      })
      const data = await response.data
      toast.success(data.msg)
      await fetchUserProfile()
      setImage(null)
    } catch (error) {
      toast.error(error.response.data.msg || error)
    } finally {
      setImageLoading(false)
    }
  }

  useEffect(() => {
    if (image) {
      updateImageAvatar()
    }
  }, [image])

  const getVerificationStatus = () => {
    if (user?.isEmailVerified) {
      return { status: 'verified', icon: <MdVerified />, color: 'text-green-600', bg: 'bg-green-50', text: 'Verified' }
    }
    return { status: 'pending', icon: <MdPending />, color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Pending' }
  }

  const getKYCStatus = () => {
    const kycStatus = user?.kyc_status || 'not_submitted'
    switch (kycStatus) {
      case 'verified':
        return { status: 'verified', icon: <MdVerified />, color: 'text-green-600', bg: 'bg-green-50', text: 'KYC Verified' }
      case 'pending':
        return { status: 'pending', icon: <MdPending />, color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'KYC Pending' }
      case 'rejected':
        return { status: 'rejected', icon: <MdError />, color: 'text-red-600', bg: 'bg-red-50', text: 'KYC Rejected' }
      default:
        return { status: 'not_submitted', icon: <FaExclamationTriangle />, color: 'text-orange-600', bg: 'bg-orange-50', text: 'KYC Required' }
    }
  }

  const verificationStatus = getVerificationStatus()
  const kycStatus = getKYCStatus()

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      {/* Hero Card */}
      <div className="relative w-full max-w-2xl mb-8">
        <div className="absolute left-1/2 -top-20 -translate-x-1/2 z-10">
          <div className="w-40 h-40 rounded-full bg-white/80 p-2 shadow-2xl relative border-4 border-blue-200">
            {imageLoading ? (
              <div className="w-full h-full flex justify-center items-center">
                <CgSpinner className='animate-spin text-5xl text-indigo-600' />
              </div>
            ) : (
              <img 
                src={image ? URL.createObjectURL(image) : user?.image || '/default-avatar.png'} 
                className="border rounded-full shadow-lg w-full h-full object-cover" 
                alt="Profile" 
              />
            )}
            <input 
              accept='image/*' 
              onChange={(e) => setImage(e.target.files[0])} 
              ref={imageRef} 
              type="file" 
              className='hidden' 
            />
            <button 
              disabled={imageLoading} 
              onClick={onFilePickHandler} 
              className="absolute bottom-3 right-3 shadow-lg text-indigo-600 bg-white rounded-full p-3 text-2xl hover:bg-gray-50 transition-colors border border-blue-200"
              title="Change photo"
            >
              <CiCamera />
            </button>
          </div>
        </div>
        <div className="pt-28 pb-8 px-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center border border-blue-100">
          <h1 className="text-3xl font-extrabold mb-1 mt-2 text-gray-900 flex items-center gap-2">
            {user?.name || 'User Name'}
            {verificationStatus.status === 'verified' && <MdVerified className="text-green-500" title="Email Verified" />}
          </h1>
          <div className="flex flex-col md:flex-row gap-2 items-center mb-2">
            <span className="text-gray-500 text-base flex items-center gap-1"><FaEnvelope className="inline" /> {user?.email}</span>
            {!user?.isEmailVerified && <VerifiedEMailModel />}
            <span className="text-gray-500 text-base flex items-center gap-1"><FaPhone className="inline" /> {user?.mobile_no}</span>
          </div>
          <span className="text-gray-400 text-sm mb-3">{user?.bio || 'No bio added yet'}</span>
          <div className="flex gap-2 mb-4">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${verificationStatus.bg} ${verificationStatus.color} bg-opacity-90`}>
              {verificationStatus.icon}
              {verificationStatus.text}
            </span>
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${kycStatus.bg} ${kycStatus.color} bg-opacity-90`}>
              {kycStatus.icon}
              {kycStatus.text}
            </span>
          </div>
          <div className="flex gap-8 mt-2">
            <div className="flex flex-col items-center px-6 py-2 bg-blue-50 rounded-xl shadow-sm">
              <span className="text-xl font-bold text-blue-900">{user?.account_no?.length || 0}</span>
              <span className="text-xs text-blue-700">Accounts</span>
            </div>
            <div className="flex flex-col items-center px-6 py-2 bg-blue-50 rounded-xl shadow-sm">
              <span className="text-xl font-bold text-blue-900">100%</span>
              <span className="text-xs text-blue-700">Profile</span>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="w-full max-w-2xl bg-white/90 rounded-3xl shadow-xl p-6 border border-blue-100">
        <Tab.Group selectedIndex={tabIndex} onChange={setTabIndex}>
          <Tab.List className="flex gap-2 mb-6">
            {['Personal Info', 'Security', 'Account Details', 'Preferences', 'Activity'].map((tab, idx) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `px-4 py-2 rounded-full text-sm font-semibold transition-all ${selected ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {/* Personal Info Tab */}
            <Tab.Panel>
              {/* Update Profile Form (as before) */}
              <Formik 
                validationSchema={validationSchema} 
                initialValues={{
                  name: user?.name || '',
                  mobile_no: user?.mobile_no || '',
                  bio: user?.bio || ''
                }}
                enableReinitialize={true}
                onSubmit={onSubmitHandler}
              >
                <Form className="space-y-5">
                  <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FaUser className="text-indigo-600" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Field 
                      id="name" 
                      name="name" 
                      type="text" 
                      className='w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors' 
                      placeholder='Enter Your Full Name' 
                    />
                    <ErrorMessage name="name" className='text-red-500 text-sm' component={'p'} />
                  </div>
                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FaEnvelope className="text-indigo-600" />
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        readOnly 
                        id="email" 
                        value={user?.email || ''} 
                        type="text" 
                        className='w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-xl outline-none' 
                        placeholder='Email Address' 
                      />
                      {!user?.isEmailVerified && <VerifiedEMailModel />}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="mobile_no" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FaPhone className="text-indigo-600" />
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Field 
                      name="mobile_no" 
                      type="text"
                      id="mobile_no" 
                      onInput={onlyInputNumber}
                      className='w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors' 
                      placeholder='Enter Mobile Number' 
                    />
                    <ErrorMessage name="mobile_no" className='text-red-500 text-sm' component={'p'} />
                  </div>
                  <div>
                    <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FaEdit className="text-indigo-600" />
                      Bio
                    </label>
                    <Field 
                      name="bio" 
                      as="textarea"
                      id="bio"  
                      rows="3" 
                      className='w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors resize-none' 
                      placeholder='Tell us about yourself...' 
                    />
                    <ErrorMessage name="bio" className='text-red-500 text-sm' component={'p'} />
                  </div>
                  <div>
                    <CustomAuthButton 
                      isLoading={loader} 
                      text={'Update Profile'} 
                      className='bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-xl font-medium transition-colors' 
                      type='submit' 
                    />
                  </div>
                </Form>
              </Formik>
            </Tab.Panel>
            {/* Security Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaLock className="text-blue-600 text-xl" />
                  <span className="font-semibold text-gray-800">Change Password</span>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Change your account password for better security.</p>
                  <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Old Password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    {passwordMsg && (
                      <div className={`text-sm mt-2 ${passwordMsg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{passwordMsg.text}</div>
                    )}
                  </form>
                </div>
              </div>
            </Tab.Panel>
            {/* Account Details Tab */}
            <Tab.Panel>
              {user ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <MdAccountBalance className="text-blue-600 text-xl" />
                    <span className="font-semibold text-gray-800">Account Numbers</span>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Your linked account numbers:</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(user?.account_no) ? user.account_no : []).map((acc, idx) => (
                        <span key={idx} className="bg-white border border-blue-200 px-4 py-2 rounded-xl font-mono text-blue-700 text-sm">{acc}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCoins className="text-green-600 text-xl" />
                    <span className="font-semibold text-gray-800">UPI ID</span>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 flex items-center gap-2">
                    <span className="font-mono text-green-700">{user?.upi_id || 'Not Set'}</span>
                    <button className="bg-green-600 text-white px-3 py-1 rounded-xl font-semibold hover:bg-green-700 transition-all text-xs">Copy</button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">Loading account details...</div>
              )}
            </Tab.Panel>
            {/* Preferences Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaCog className="text-indigo-600 text-xl" />
                  <span className="font-semibold text-gray-800">Theme</span>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 flex items-center gap-4">
                  <span className="text-sm text-gray-700">Dark Mode</span>
                  <button
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${darkMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <FaBell className="text-yellow-500 text-xl" />
                  <span className="font-semibold text-gray-800">Notifications</span>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-4">
                  <span className="text-sm text-gray-700">Email Alerts</span>
                  <button
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${notifications ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setNotifications(!notifications)}
                  >
                    {notifications ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </Tab.Panel>
            {/* Activity Tab */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <FaHistory className="text-purple-600 text-xl" />
                  <span className="font-semibold text-gray-800">Recent Activity</span>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Recent logins and device info (placeholder):</p>
                  <ul className="text-xs text-gray-700 list-disc pl-4">
                    <li>2024-06-01 10:23 - Chrome on Windows</li>
                    <li>2024-05-30 18:12 - Mobile App</li>
                  </ul>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}

export default ProfilePage
