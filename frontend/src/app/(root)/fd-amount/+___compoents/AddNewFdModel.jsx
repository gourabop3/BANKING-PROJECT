"use client";
import CustomAuthButton from '@/components/reuseable/CustomAuthButton';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { Dialog, Transition } from '@headlessui/react'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react'
import { LiaPlusSolid } from "react-icons/lia";
import { toast } from 'react-toastify';
import { RiCloseLargeLine } from "react-icons/ri";
import { generateAccountNumber, formatAccountNumber, getAccountTypeDisplayName } from '@/utils/accountUtils';
import * as yup from 'yup'

export default function AddNewFdModel({ isUpdate, setIsUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, fetchUserProfile } = useMainContext()
  const [loading, setLoading] = useState(false)

  const initialStates = {
    amount: '',
    account: '',
    apply_for: ''
  }

  const validationSchema = yup.object({
    amount: yup.number()
      .min(1, "Minimum 1 Rs required")
      .max(1000000, "Maximum 10,00,000 Rs allowed")
      .required("Amount is Required"),
    account: yup.string().required("Account is Required"),
    apply_for: yup.string()
      .min(3, "Purpose must be at least 3 characters")
      .max(50, "Purpose must be less than 50 characters")
      .required("Purpose is Required"),
  })

  const onSubmitHandler = async (values, { resetForm }) => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error('Please login to continue')
        return
      }

      // Validate amount against account balance
      const selectedAccount = user?.account_no?.find(acc => acc._id === values.account)
      if (selectedAccount && parseInt(values.amount) >= selectedAccount.amount) {
        toast.error('Insufficient balance. Amount must be less than account balance.')
        return
      }

      const response = await axiosClient.post('/fd/add-new', {
        amount: parseInt(values.amount),
        account: values.account,
        apply_for: values.apply_for.trim()
      }, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })

      const data = await response.data
      
      // Update user profile and parent state
      if (fetchUserProfile && typeof fetchUserProfile === 'function') {
        await fetchUserProfile()
      }
      
      if (setIsUpdate && typeof setIsUpdate === 'function') {
        setIsUpdate(prev => !prev)
      }
      
      toast.success(data.msg || 'Fixed Deposit created successfully!')
      resetForm()
      closeModal()

    } catch (error) {
      console.error('Error creating FD:', error)
      const errorMessage = error?.response?.data?.msg || error?.message || 'Failed to create Fixed Deposit'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  // Check if user has accounts
  const hasAccounts = user && user.account_no && user.account_no.length > 0
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please login to create a Fixed Deposit.</p>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={openModal} 
        className="w-full border border-dashed border-green-600 rounded shadow px-4 py-6 flex items-center justify-center flex-col hover:bg-green-600 hover:text-white transition-all duration-300 cursor-pointer text-green-600 group"
      >
        <LiaPlusSolid className="text-5xl transition-all duration-300 group-hover:scale-110" />
        <p className="transition-all duration-300 font-medium mt-2">Create Fixed Deposit</p>
      </div>

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
            <div className="fixed inset-0 bg-black/25" />
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="div"
                    className="text-lg flex items-center justify-between font-medium leading-6 text-gray-900"
                  >
                    <p className="text-xl font-bold text-green-600">Create Fixed Deposit</p>
                    <button 
                      onClick={closeModal} 
                      type='button' 
                      className='text-xl p-2 bg-green-100 hover:bg-green-200 rounded-full text-green-700 cursor-pointer transition-colors'
                    >
                      <RiCloseLargeLine/>
                    </button>
                  </Dialog.Title>
                  
                  <div className="mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        <strong>Daily Interest Rate:</strong> 0.1% per day<br/>
                        <strong>Minimum Amount:</strong> ₹1<br/>
                        <strong>Note:</strong> Interest is calculated daily and can be claimed anytime
                      </p>
                    </div>

                    {!hasAccounts ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No accounts available to create Fixed Deposit</p>
                        <button 
                          onClick={closeModal}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <Formik 
                        validationSchema={validationSchema} 
                        onSubmit={onSubmitHandler} 
                        initialValues={initialStates}
                      >
                        {({ values, setFieldValue }) => (
                          <Form className='space-y-4'>
                            <div>
                              <label htmlFor="apply_for" className="block text-sm font-medium text-gray-700 mb-1">
                                Purpose <span className="text-red-500">*</span>
                              </label>
                              <Field 
                                type="text" 
                                name='apply_for' 
                                id='apply_for' 
                                className='w-full bg-transparent border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-md py-3 px-4 outline-none transition-all' 
                                placeholder='Enter FD Purpose (e.g., Savings, Emergency Fund)...' 
                              />
                              <ErrorMessage className='text-red-500 text-sm mt-1' component={'p'} name='apply_for' />
                            </div>

                            <div>
                              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                Amount <span className="text-red-500">*</span>
                              </label>
                              <Field 
                                type="number" 
                                name='amount' 
                                id='amount' 
                                className='w-full bg-transparent border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-md py-3 px-4 outline-none transition-all' 
                                placeholder='Enter FD Amount (₹)' 
                                min="1"
                                max="1000000"
                              />
                              <ErrorMessage className='text-red-500 text-sm mt-1' component={'p'} name='amount' />
                              
                              {values.account && values.amount && (
                                <div className="mt-2 text-sm">
                                  {(() => {
                                    const selectedAccount = user?.account_no?.find(acc => acc._id === values.account);
                                    const availableBalance = selectedAccount?.amount || 0;
                                    const fdAmount = parseInt(values.amount) || 0;
                                    const remainingBalance = availableBalance - fdAmount;
                                    
                                    return (
                                      <p className={remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        Available: ₹{availableBalance.toLocaleString()} | 
                                        After FD: ₹{remainingBalance.toLocaleString()}
                                      </p>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            <div>
                              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Account <span className="text-red-500">*</span>
                              </label>
                              <Field  
                                as="select" 
                                name='account' 
                                id='account' 
                                className='w-full bg-transparent border border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-md py-3 px-4 outline-none transition-all'
                              >
                                <option value="">-- Select Account --</option>
                                {user.account_no.map((account, index) => {
                                  try {
                                    const accountNumber = generateAccountNumber(user._id, account._id, account.ac_type);
                                    const formattedAccountNumber = formatAccountNumber(accountNumber);
                                    const accountType = getAccountTypeDisplayName(account.ac_type);
                                    
                                    return (
                                      <option key={index} value={account._id}>
                                        {`${formattedAccountNumber} - ${accountType} - ₹${account.amount?.toLocaleString() || 0}`}
                                      </option>
                                    );
                                  } catch (error) {
                                    console.error('Error formatting account:', error);
                                    return (
                                      <option key={index} value={account._id}>
                                        {`Account ${index + 1} - ₹${account.amount?.toLocaleString() || 0}`}
                                      </option>
                                    );
                                  }
                                })}
                              </Field>
                              <ErrorMessage className='text-red-500 text-sm mt-1' component={'p'} name='account' />
                            </div>

                            <div className="pt-4">
                              <CustomAuthButton 
                                isLoading={loading} 
                                text={loading ? 'Creating...' : 'Create Fixed Deposit'} 
                                className="w-full bg-green-600 hover:bg-green-700"
                              />
                            </div>
                          </Form>
                        )}
                      </Formik>
                    )}
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
