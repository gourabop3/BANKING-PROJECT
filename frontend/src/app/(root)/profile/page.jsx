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

const ProfilePage = () => {
  const { user, fetchUserProfile } = useMainContext()
  const [loader, setLoader] = useState(false)
  const [image, setImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const imageRef = useRef(null)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        <HeaderName />

        {/* Professional Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image Section */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-2 shadow-lg relative">
                {imageLoading ? (
                  <div className="w-full h-full flex justify-center items-center">
                    <CgSpinner className='animate-spin text-4xl text-indigo-600' />
                  </div>
                ) : (
                  <img 
                    src={image ? URL.createObjectURL(image) : user?.image || '/default-avatar.png'} 
                    className="border rounded-full shadow-sm w-full h-full object-cover" 
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
                  className="absolute bottom-2 right-2 shadow-lg text-indigo-600 bg-white rounded-full p-2 text-lg hover:bg-gray-50 transition-colors"
                >
                  <CiCamera />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{user?.name || 'User Name'}</h1>
              <p className="text-indigo-100 mb-1">{user?.email}</p>
              <p className="text-indigo-200 text-sm mb-4">{user?.bio || 'No bio added yet'}</p>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${verificationStatus.bg} ${verificationStatus.color} bg-opacity-90`}>
                  {verificationStatus.icon}
                  {verificationStatus.text}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${kycStatus.bg} ${kycStatus.color} bg-opacity-90`}>
                  {kycStatus.icon}
                  {kycStatus.text}
                </div>
               
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
                <div className="text-2xl font-bold text-gray-900">
                  {user?.account_no?.length || 0}
                </div>
                <div className="text-sm text-gray-700">Accounts</div>
              </div>
              <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-xl p-4 text-gray-800">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-700">Profile</div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: <FaUser /> },
                { id: 'security', label: 'Security', icon: <FaLock /> },
                { id: 'account', label: 'Account Details', icon: <MdAccountBalance /> },
                { id: 'preferences', label: 'Preferences', icon: <FaCog /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'personal' && (
              <div className="space-y-8">
                {/* Personal Information Form */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <FaEdit className="text-indigo-600" />
                    Personal Information
                  </h3>
                  
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
                    <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
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

                      <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaEnvelope className="text-indigo-600" />
                          Email Address
                        </label>
                        <input 
                          readOnly 
                          id="email" 
                          value={user?.email || ''} 
                          type="text" 
                          className='w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-xl outline-none' 
                          placeholder='Email Address' 
                        />
                      </div>

                      <div className="space-y-2">
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

                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaEdit className="text-indigo-600" />
                          Bio
                        </label>
                        <Field 
                          name="bio" 
                          as="textarea"
                          id="bio"  
                          rows="4" 
                          className='w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors resize-none' 
                          placeholder='Tell us about yourself...' 
                        />
                        <ErrorMessage name="bio" className='text-red-500 text-sm' component={'p'} />
                      </div>

                      <div className="md:col-span-2">
                        <CustomAuthButton 
                          isLoading={loader} 
                          text={'Update Profile'} 
                          className='bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-xl font-medium transition-colors' 
                          type='submit' 
                        />
                      </div>
                    </Form>
                  </Formik>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaShieldAlt className="text-green-600" />
                  Security & Verification
                </h3>

                {/* Email Verification Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${verificationStatus.bg}`}>
                        <FaEnvelope className={`text-xl ${verificationStatus.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Email Verification</h4>
                        <p className="text-gray-600 text-sm">Secure your account with verified email</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {user?.isEmailVerified ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <MdVerified className="text-xl" />
                          Verified
                        </div>
                      ) : (
                        <VerifiedEMailModel />
                      )}
                    </div>
                  </div>
                </div>

                {/* KYC Verification Card */}
                <div className={`bg-gradient-to-r ${kycStatus.bg} border rounded-xl p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${kycStatus.bg}`}>
                        <FaIdCard className={`text-xl ${kycStatus.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">KYC Verification</h4>
                        <p className="text-gray-600 text-sm">Complete your identity verification</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 font-semibold ${kycStatus.color}`}>
                        {kycStatus.icon}
                        {kycStatus.text}
                      </div>
                      {kycStatus.status === 'not_submitted' && (
                        <button className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                          Start KYC
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FaLock className="text-blue-600 text-xl" />
                      <h4 className="font-semibold text-gray-800">Two-Factor Authentication</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Add an extra layer of security</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MdSecurity className="text-purple-600 text-xl" />
                      <h4 className="font-semibold text-gray-800">Security Alerts</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Get notified of suspicious activity</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <MdAccountBalance className="text-blue-600" />
                  Account Information
                </h3>

                {/* Account Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCreditCard className="text-blue-600 text-xl" />
                      <h4 className="font-semibold text-gray-800">Account Type</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 capitalize">{user?.ac_type || 'Saving'}</p>
                    <p className="text-gray-600 text-sm">Primary Account</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCoins className="text-green-600 text-xl" />
                      <h4 className="font-semibold text-gray-800">UPI ID</h4>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg font-bold text-green-600 font-mono">{user?.upi_id || 'Not Set'}</p>
                      {user?.upi_id && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user.upi_id);
                            // You could add a toast notification here
                          }}
                          className="p-1 text-green-600 hover:bg-green-200 rounded transition-colors"
                          title="Copy UPI ID"
                        >
                          📋
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">MyBank Digital Payment ID</p>
                    {user?.upi_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Use this ID to receive instant payments
                      </p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCalendarAlt className="text-purple-600 text-xl" />
                      <h4 className="font-semibold text-gray-800">Member Since</h4>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                    </p>
                    <p className="text-gray-600 text-sm">Years of Trust</p>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-colors">
                      <FaDownload className="text-indigo-600" />
                      <span className="text-sm font-medium">Statement</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-colors">
                      <FaHistory className="text-green-600" />
                      <span className="text-sm font-medium">History</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-colors">
                      <FaCog className="text-blue-600" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-colors">
                      <FaEye className="text-purple-600" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <FaCog className="text-gray-600" />
                  Preferences & Settings
                </h3>

                {/* Notification Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBell className="text-yellow-600" />
                    Notification Preferences
                  </h4>
                  <div className="space-y-4">
                    {[
                      { id: 'email_notifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                      { id: 'sms_alerts', label: 'SMS Alerts', desc: 'Transaction and security alerts' },
                      { id: 'push_notifications', label: 'Push Notifications', desc: 'Mobile app notifications' },
                      { id: 'marketing_emails', label: 'Marketing Emails', desc: 'Promotional offers and updates' }
                    ].map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h5 className="font-medium text-gray-800">{pref.label}</h5>
                          <p className="text-gray-600 text-sm">{pref.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaLock className="text-red-600" />
                    Privacy Settings
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-800">Profile Visibility</h5>
                        <p className="text-gray-600 text-sm">Control who can see your profile</p>
                      </div>
                      <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option>Private</option>
                        <option>Public</option>
                        <option>Limited</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-800">Data Sharing</h5>
                        <p className="text-gray-600 text-sm">Share data for improved services</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
