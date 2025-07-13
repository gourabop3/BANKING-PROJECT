"use client";
import CustomAuthButton from '@/components/reuseable/CustomAuthButton';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { CARD_TYPE } from '@/utils/constant';
import { Dialog, Transition } from '@headlessui/react'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Fragment, useState } from 'react'
import { FaPlus, FaCreditCard } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { toast } from 'react-toastify';
import { generateAccountNumber, formatAccountNumber, getAccountTypeDisplayName } from '@/utils/accountUtils';
import * as yup from 'yup'

export default function AddNewCardDialog() {
  let [isOpen, setIsOpen] = useState(false)
  const [loading,setLoading] = useState(false)
  const {user,fetchUserProfile} = useMainContext()
  
  const Types = Object.keys(CARD_TYPE)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const validationSchema = yup.object({
    account:yup.string().required("Account No is required"),
    card_type:yup.string().required("Choose Valid Card Type").oneOf(Object.keys(CARD_TYPE),"Choose Valid Card Type"),
    pin:yup.string().required("Pin No is Requird").min(4,"Pin No Should be Equal to 4 Digit").max(4,"Equal to 4 Digit")
  })

  const initialValues = {
    account:'',
    card_type:'',
    pin:''
  }

  const onSubmitHandler = async(values,{resetForm})=>{
    try {
      setLoading(true)
      
      const response = await axiosClient.post('/atm-card/add-new',values,{
        headers:{
          'Authorization':'Bearer '+ localStorage.getItem("token")
        }
      })
      const data = await response.data 

      toast.success(data.msg)
      await fetchUserProfile()
      resetForm()
      closeModal()

    } catch (error) {
      toast.error(error.response.data.msg || error.message)
    }finally{
      setLoading(false)
    }
  }


  return (
    <> 
        <button
          type="button"
          onClick={openModal}
          className="add-card-btn"
        >
         <FaPlus className="text-lg" />
         <span>Add New Card</span>
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
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                  >
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-100 p-2 rounded-lg">
                     <FaCreditCard className="text-blue-600 text-xl" />
                   </div>
                   <h3 className="text-xl font-bold">Add New ATM Card</h3>
                 </div>
                 <button onClick={closeModal} className='p-2 text-2xl text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full outline-none border-none cursor-pointer transition-colors'>
                  <IoClose/>
                 </button>
                  </Dialog.Title>
                  <div className="mt-4">
                  <div className="w-full py-3 flex justify-center items-center ">
                                <img src="/logo.svg" alt="" className='w-1/2 mx-auto' />
                            </div> 

                          <Formik  initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler}>
                          {({values,handleSubmit})=>(
                                  <form onSubmit={handleSubmit} className='py-4'>
                                    <div className="mb-4">
                                      <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">Account No.</label>
                                      <Field name="account" id="account" as="select" className="w-full py-3 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                      {
                  user && user.account_no && user.account_no.length>0 ? <>
                  <option value="">Select Account</option>
                   { user.account_no.map((cur,i)=>{
                    const accountNumber = generateAccountNumber(user._id, cur._id, cur.ac_type);
                    const formattedAccountNumber = formatAccountNumber(accountNumber);
                    const accountType = getAccountTypeDisplayName(cur.ac_type);
                    return (
                      <option key={i} className='' value={cur._id}>
                        {`${formattedAccountNumber} - ${accountType} - ₹${cur.amount}`}
                      </option>
                    );
                  })}
                  </>:
                  <option value="">No Account Available</option>
                 }
                                      </Field>   
                                      <ErrorMessage  className='text-red-500 text-sm mt-1' component={'p'} name='account'  /> 
                                    </div>
                                    <div className="mb-4">
                                    <label htmlFor="card_type" className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
                                        <Field as="select" className="w-full py-3 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"  name="card_type" id="card_type">
                                        {
                                      
                                      Types  && Types.length>0 ? <>
                  <option value="">Select Card Type</option>
                   { Types.map((cur,i)=>{
                    return <option key={i} className='' value={cur}>{cur}</option>
                  })}
                  </>:
                  <option value="">No Card Type Here</option>
                 }
                                        </Field>
                                    <ErrorMessage  className='text-red-500 text-sm mt-1' component={'p'} name='card_type'  /> 
                                    </div>

                 <div className="mb-6">
                  <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">PIN</label>
                  <Field type="text" id="pin" name="pin" className="w-full py-3 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder='Enter 4-digit PIN' onInput={(e)=>{
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }} />
                  <ErrorMessage  className='text-red-500 text-sm mt-1' component={'p'} name='pin'  /> 
                 </div>

                      <div className="mb-3">
                        <CustomAuthButton isLoading={loading}  text={'Create Card'} />
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
