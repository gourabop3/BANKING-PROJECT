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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="relative w-full max-w-md mb-8">
        {/* Floating Profile Image */}
        <div className="absolute left-1/2 -top-16 -translate-x-1/2 z-10">
          <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg relative">
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
        {/* Modern Profile Card */}
        <div className="pt-20 pb-8 px-6 bg-white/90 rounded-2xl shadow-2xl flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1 mt-2 text-gray-900">{user?.name || 'User Name'}</h1>
          <span className="text-gray-500 text-sm mb-1">{user?.email}</span>
          <span className="text-gray-400 text-xs mb-3">{user?.bio || 'No bio added yet'}</span>
          {/* Badges */}
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
          {/* Stats */}
          <div className="flex gap-6 mt-2">
            <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-xl shadow-sm">
              <span className="text-lg font-bold text-gray-900">{user?.account_no?.length || 0}</span>
              <span className="text-xs text-gray-500">Accounts</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-gray-50 rounded-xl shadow-sm">
              <span className="text-lg font-bold text-gray-900">100%</span>
              <span className="text-xs text-gray-500">Profile</span>
            </div>
          </div>
        </div>
      </div>
      {/* Update Profile Form */}
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-700">
          <FaEdit /> Update Profile
        </h2>
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
      </div>
    </div>
  )
}

export default ProfilePage
