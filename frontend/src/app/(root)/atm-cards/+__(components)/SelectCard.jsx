"use client";
import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
 
import { RiExpandUpDownLine as ChevronUpDownIcon } from "react-icons/ri";
import { FaCheck as CheckIcon } from "react-icons/fa6";
import { useMainContext } from '@/context/MainContext';
import { generateAccountNumber, formatAccountNumber } from '@/utils/accountUtils';
 

export default function SelectCard() {

  const {user,fetchATMDetails,atm}= useMainContext() 
  const [selected, setSelected] = useState('')

  useEffect(()=>{
if(selected){
  fetchATMDetails(selected)
}
  },[selected])


  console.log(atm)

  // Helper to get formatted account number for an ATM record
  const getFormattedAccountNumber = (atmItem)=>{
    if(!user) return atmItem.account;
    const accountObj = user?.account_no?.find(acc=>acc._id === atmItem.account);
    if(!accountObj) return atmItem.account;
    const accNum = generateAccountNumber(user._id, accountObj._id, accountObj.ac_type);
    return formatAccountNumber(accNum);
  }

  const selectedAtm = user?.atms?.find(a=>a._id===selected);
  const selectedLabel = selectedAtm ? getFormattedAccountNumber(selectedAtm) : selected;

  return ( 
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selectedLabel}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {user && user.atms && user.atms.map((atm, atmIdx) => (
                <Listbox.Option
                  key={atmIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-rose-100 text-rose-900' : 'text-gray-900'
                    }`
                  }
                  value={atm._id}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                       {` ${getFormattedAccountNumber(atm)} - ${atm?.card_type}`}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox> 
  )
}
