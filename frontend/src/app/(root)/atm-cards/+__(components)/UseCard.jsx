"use client";
import CustomAuthButton from '@/components/reuseable/CustomAuthButton';
import { useMainContext } from '@/context/MainContext'
import { axiosClient } from '@/utils/AxiosClient'
import { CARD_TYPE } from '@/utils/constant';
import { Dialog, Transition } from '@headlessui/react'
import { ErrorMessage, Form, Formik, Field } from 'formik'
import { Fragment, useState } from 'react'
import { RiCloseLargeLine } from 'react-icons/ri'
import { toast } from 'react-toastify'
import * as yup from 'yup'

export default function UseCardModel({ type, atmCard }) {
  let [isOpen, setIsOpen] = useState(false)
  const { user, fetchUserProfile } = useMainContext()
  const [loading, setLoading] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const initialValues = {
    amount: '',
    pin: ''
  }

  const max_amount = type === 'basic' ? CARD_TYPE.basic.max : type === 'classic' ? CARD_TYPE.classic.max : type === 'platinum' ? CARD_TYPE.platinum.max : 0

  const validationSchema = yup.object({
    amount: yup.number()
      .required("Amount is Required")
      .min(1, "At least Enter 1 Rs for Withdrawal")
      .max(max_amount, `Maximum amount should be ${max_amount} Rs`),
    pin: yup.string()
      .required("PIN is Required")
      .matches(/^\d{4}$/, "PIN must be exactly 4 digits")
  })

  const onSubmitHandler = async (values, { resetForm }) => {
    try {
      setLoading(true)
      
      if (!atmCard || !atmCard._id) {
        toast.error("ATM Card information not available")
        return
      }

      const response = await axiosClient.post(`/atm-card/withdrawal/${atmCard._id}`, {
        amount: parseInt(values.amount),
        pin: parseInt(values.pin)
      }, {
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
      console.error('Withdrawal error:', error)
      toast.error(error.response?.data?.msg || error.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={openModal} 
        className='py-3 px-6 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px]'
      >
        Use Card
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="div"
                    className="text-lg flex items-center justify-between font-medium leading-6 text-gray-900"
                  >
                    <div>
                      <p className="text-xl font-bold text-gray-800">ATM Withdrawal</p>
                      <p className="text-sm text-gray-600 capitalize">{type} Card - Max: ₹{max_amount}</p>
                    </div>
                    <button 
                      onClick={closeModal} 
                      type='button' 
                      className='text-xl p-2 bg-rose-100 hover:bg-rose-200 rounded-full text-rose-700 cursor-pointer transition-colors'
                    >
                      <RiCloseLargeLine />
                    </button>
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="w-full py-3 flex justify-center items-center">
                      <img src="/logo.svg" alt="" className='w-1/2 mx-auto' />
                    </div>

                    <Formik 
                      initialValues={initialValues} 
                      validationSchema={validationSchema} 
                      onSubmit={onSubmitHandler}
                    >
                      <Form className='py-4 space-y-4'>
                        <div className="mb-4">
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Withdrawal Amount (₹)
                          </label>
                          <Field 
                            type="text" 
                            id="amount" 
                            name="amount" 
                            className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 focus:border-rose-500 focus:outline-none transition-colors text-lg font-medium" 
                            placeholder='Enter amount' 
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(/\D/g, "");
                            }} 
                          />
                          <ErrorMessage className='text-red-500 text-sm mt-1' component={'p'} name='amount' />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                            ATM PIN
                          </label>
                          <Field 
                            type="password" 
                            id="pin" 
                            name="pin" 
                            className="w-full py-3 px-4 rounded-lg border-2 border-gray-300 focus:border-rose-500 focus:outline-none transition-colors text-lg font-medium text-center tracking-widest" 
                            placeholder='••••' 
                            maxLength="4"
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(/\D/g, "");
                            }} 
                          />
                          <ErrorMessage className='text-red-500 text-sm mt-1' component={'p'} name='pin' />
                        </div>

                        <div className="mb-4 pt-2">
                          <CustomAuthButton 
                            isLoading={loading} 
                            text={loading ? 'Processing...' : 'Withdraw Amount'} 
                            className="w-full py-3 text-lg font-medium"
                          />
                        </div>
                      </Form>
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
