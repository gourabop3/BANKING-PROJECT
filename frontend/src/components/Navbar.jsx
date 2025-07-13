"use client";
import React from 'react'
import Logo from './reuseable/Logo'
import Link from 'next/link'
import { useMainContext } from '@/context/MainContext'
import { GiHamburgerMenu } from "react-icons/gi";
import { useDispatch } from 'react-redux';
import { setIsToggle } from '@/redux/slice/sidebarSlice';

const Navbar = () => {

    const {user,LogoutHandler} = useMainContext()
    const dispatch = useDispatch()

  return (
    <>
            <header className="w-full border-b rounded-b-md ">
        <nav className=" w-[98%] lg:w-[80%] mx-auto  py-3 flex items-center justify-between">
           <div className="flex items-center gap-x-2">
            <button  onClick={()=>dispatch(setIsToggle())} className='bg-gray-100 rounded-full p-2 sm:hidden text-xl hover:bg-gray-200 cursor-pointer '><GiHamburgerMenu/> </button>
           <Logo/>
           </div>

            <ul className="flex items-center justify-center gap-6 text-gray-700 font-medium">
                <li className="hover:text-indigo-600 transition-colors">
                    <Link href={'/'}>Home</Link>
                </li>
            
                <li className="hover:text-indigo-600 transition-colors">
                    <Link href={'/about'}>About</Link>
                </li>
              {user ?<>
                <li className="hover:text-indigo-600 transition-colors">
                    <Link href={'/kyc'}>KYC</Link>
                </li>
                <li>
                    <button onClick={LogoutHandler} className='bg-rose-600 hover:bg-rose-700 transition-colors text-white px-5 py-2 cursor-pointer font-semibold rounded-md shadow'>Logout</button>
                </li>
              </>:  <li className="hover:text-indigo-600 transition-colors">
                    <Link href={'/login'}>Login</Link>
                </li>}
            </ul>
        </nav>

            </header>
    </>
  )
}

export default Navbar