"use client";
import CustomAuthButton from '@/components/reuseable/CustomAuthButton';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { CARD_TYPE } from '@/utils/constant';
import { Dialog, Transition } from '@headlessui/react'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react'
import { FaPlus, FaCreditCard, FaShieldAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { MdSecurity, MdContactless } from 'react-icons/md';
import { toast } from 'react-toastify';
import { generateAccountNumber, formatAccountNumber, getAccountTypeDisplayName } from '@/utils/accountUtils';
import * as yup from 'yup'

export default function AddNewCardDialog() {
  let [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const { user, fetchUserProfile } = useMainContext()
  
  const Types = Object.keys(CARD_TYPE)

  function closeModal() {
    setIsOpen(false)
    setShowPin(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const validationSchema = yup.object({
    account: yup.string().required("Account No is required"),
    card_type: yup.string().required("Choose Valid Card Type").oneOf(Object.keys(CARD_TYPE), "Choose Valid Card Type"),
    pin: yup.string()
      .required("PIN is required")
      .min(4, "PIN must be exactly 4 digits")
      .max(4, "PIN must be exactly 4 digits")
      .matches(/^\d{4}$/, "PIN must contain only numbers")
  })

  const initialValues = {
    account: '',
    card_type: '',
    pin: ''
  }

  const onSubmitHandler = async (values, { resetForm }) => {
    try {
      setLoading(true)
      
      const response = await axiosClient.post('/atm-card/add-new', values, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem("token")
        }
      })
      const data = await response.data 

      toast.success(data.msg)
      await fetchUserProfile()
      resetForm()
      closeModal()

    } catch (error) {
      toast.error(error.response?.data?.msg || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <> 
      <button
        type="button"
        onClick={openModal}
        className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out border-0 outline-none"
      >
        <div className="relative">
          <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <span className="font-medium">Add New Card</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button> 

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                          <FaCreditCard className="text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Add New ATM Card</h3>
                          <p className="text-blue-100 text-sm">Secure card creation</p>
                        </div>
                      </div>
                      <button 
                        onClick={closeModal} 
                        className='p-2 text-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200'
                      >
                        <IoClose />
                      </button>
                    </div>
                    
                    {/* Security Features */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-green-400" />
                        <span>256-bit Encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdContactless className="text-blue-300" />
                        <span>Contactless Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="p-6">
                    <div className="w-full py-4 flex justify-center items-center">
                      <img src="/logo.svg" alt="" className='w-1/2 mx-auto' />
                    </div> 

                    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler}>
                      {({ values, handleSubmit, isSubmitting }) => (
                        <form onSubmit={handleSubmit} className='space-y-6'>
                          {/* Account Selection */}
                          <div className="space-y-2">
                            <label htmlFor="account" className="block text-sm font-semibold text-gray-700">
                              Select Account
                            </label>
                            <Field 
                              name="account" 
                              id="account" 
                              as="select" 
                              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                            >
                              <option value="">Choose your account</option>
                              {user && user.account_no && user.account_no.length > 0 ? (
                                user.account_no.map((cur, i) => {
                                  const accountNumber = generateAccountNumber(user._id, cur._id, cur.ac_type);
                                  const formattedAccountNumber = formatAccountNumber(accountNumber);
                                  const accountType = getAccountTypeDisplayName(cur.ac_type);
                                  return (
                                    <option key={i} value={cur._id} className='py-2'>
                                      {`${formattedAccountNumber} - ${accountType} - ₹${cur.amount}`}
                                    </option>
                                  );
                                })
                              ) : (
                                <option value="" disabled>No accounts available</option>
                              )}
                            </Field>   
                            <ErrorMessage className='text-red-500 text-sm' component={'p'} name='account' /> 
                          </div>

                          {/* Card Type Selection */}
                          <div className="space-y-2">
                            <label htmlFor="card_type" className="block text-sm font-semibold text-gray-700">
                              Card Type
                            </label>
                            <Field 
                              as="select" 
                              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"  
                              name="card_type" 
                              id="card_type"
                            >
                              <option value="">Select card type</option>
                              {Types && Types.length > 0 ? (
                                Types.map((cur, i) => (
                                  <option key={i} value={cur} className='py-2'>{cur}</option>
                                ))
                              ) : (
                                <option value="" disabled>No card types available</option>
                              )}
                            </Field>
                            <ErrorMessage className='text-red-500 text-sm' component={'p'} name='card_type' /> 
                          </div>

                          {/* PIN Input */}
                          <div className="space-y-2">
                            <label htmlFor="pin" className="block text-sm font-semibold text-gray-700">
                              Card PIN
                            </label>
                            <div className="relative">
                              <Field 
                                type={showPin ? "text" : "password"}
                                id="pin" 
                                name="pin" 
                                className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                placeholder='Enter 4-digit PIN'
                                maxLength="4"
                                onInput={(e) => {
                                  e.target.value = e.target.value.replace(/\D/g, "");
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showPin ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaLock className="text-gray-400" />
                              <span>Your PIN is encrypted and secure</span>
                            </div>
                            <ErrorMessage className='text-red-500 text-sm' component={'p'} name='pin' /> 
                          </div>

                          {/* Security Notice */}
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <MdSecurity className="text-blue-600 text-lg mt-0.5" />
                              <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Security Notice</p>
                                <p>Your card will be delivered securely. PIN will be sent separately for enhanced security.</p>
                              </div>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="pt-4">
                            <CustomAuthButton 
                              isLoading={loading}  
                              text={'Create Card'} 
                              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                            />
                          </div>
                        </form>
                      )}
                    </Formik>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
