"use client";
import { onlyInputNumber } from '@/utils/constant';
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { FaEnvelope, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import * as yup from 'yup'
import {Form,Formik,Field,ErrorMessage} from 'formik'
import { toast } from 'react-toastify';
import CustomAuthButton from '@/components/reuseable/CustomAuthButton';
import { axiosClient } from '@/utils/AxiosClient';
import { useMainContext } from '@/context/MainContext';

export default function VerifiedEMailModel() {
  const {fetchUserProfile} = useMainContext()
  let [isOpen, setIsOpen] = useState(false)
  const [loader,setLoader] = useState(false)
  const [isLoading,setIsLoading] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const [initialValues,setInitialValues] =useState({
    token:'',
    otp:''
  })

  const validationSchema = yup.object({
    otp:yup.string().required("OTP is required")
    .min(6,"OTP Should be equal to 6 digit")
    .max(6,"OTP Should be equal to 6 digit")
  })

  const onSubmitHandler = async(e)=>{
    try {
      setLoader(true)
      const response =await axiosClient.post('/auth/verify-email',e,{
        headers:{
          'Authorization':'Bearer '+ localStorage.getItem("token")
        }
      })
      const data  = await response.data 
      toast.success(data.msg)
      await fetchUserProfile()
      closeModal()
    } catch (error) {
      toast.error(error.response.data.msg || error.message)
    }finally{
      setLoader(false)
    }
  }

  const ClickHandler = async()=>{
    try {
      setIsLoading(true)
      const response =await axiosClient.post('/auth/send-email-otp',{},{
        headers:{
          'Authorization':'Bearer '+ localStorage.getItem("token")
        }
      })
      const data = await response.data 
      setInitialValues({
        ...initialValues,
        token:data.token
      })
      openModal()
    } catch (error) {
      toast.error(error.response.data.msg || error.message)
    }finally{
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-center items-center">
        <button
          disabled={isLoading}
          type="button"
          onClick={ClickHandler}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-white rounded-xl py-3 px-6 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaEnvelope className="text-sm" />
          {isLoading ? 'Sending...' : 'Verify Email'}
        </button>
      </div>

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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                    <Dialog.Title
                      as="div"
                      className="flex items-center justify-between text-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                          <FaShieldAlt className="text-lg" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold">Email Verification</h3>
                          <p className="text-green-100 text-sm">Secure your account</p>
                        </div>
                      </div>
                      <button 
                        onClick={closeModal}
                        className='text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors'
                      >
                        <IoMdClose className="text-xl" />
                      </button>
                    </Dialog.Title>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="bg-green-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <FaEnvelope className="text-2xl text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Check Your Email</h4>
                      <p className="text-gray-600 text-sm">
                        We've sent a 6-digit verification code to your email address. 
                        Please enter it below to verify your account.
                      </p>
                    </div>

                    <Formik 
                      initialValues={initialValues}
                      onSubmit={onSubmitHandler}
                      validationSchema={validationSchema}
                    >
                      <Form className="space-y-6">
                        <div>
                          <label 
                            htmlFor="otp" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Verification Code
                          </label>
                          <Field 
                            id="otp"  
                            onInput={onlyInputNumber} 
                            type="text" 
                            className="w-full py-3 px-4 text-center text-xl font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors tracking-widest"  
                            name="otp" 
                            placeholder='••••••'
                            maxLength="6"
                          />
                          <ErrorMessage name='otp' className='text-red-500 text-sm mt-1' component={'p'} />
                        </div>

                        <div className="space-y-4">
                          <CustomAuthButton 
                            className='w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-lg' 
                            isLoading={loader} 
                            text={
                              <div className="flex items-center justify-center gap-2">
                                <FaCheckCircle />
                                Verify Email
                              </div>
                            }
                          />

                          <div className="text-center">
                            <p className="text-gray-600 text-sm">
                              Didn't receive the code?{' '}
                              <button 
                                type="button"
                                onClick={ClickHandler}
                                disabled={isLoading}
                                className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                              >
                                Resend
                              </button>
                            </p>
                          </div>
                        </div>
                      </Form>
                    </Formik>

                    {/* Security Note */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FaShieldAlt className="text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="text-blue-800 font-medium text-sm">Security Note</h5>
                          <p className="text-blue-700 text-xs mt-1">
                            Email verification adds an extra layer of security to your account and enables important notifications.
                          </p>
                        </div>
                      </div>
                    </div>
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
