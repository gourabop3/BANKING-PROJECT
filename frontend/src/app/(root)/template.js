"use client";
import Loader from '@/components/Loader';
import { useMainContext } from '@/context/MainContext';
import { setIsToggle, SidebarSlicePath } from '@/redux/slice/sidebarSlice';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import AppSidebar from '@/components/AppSidebar';
import { useDispatch, useSelector } from 'react-redux';
import PageFade from '@/components/ui/PageFade';
import { MenuItem } from 'react-pro-sidebar';
import {MdDashboard} from 'react-icons/md'
import { GiFalloutShelter } from 'react-icons/gi';
import { GrCurrency } from "react-icons/gr";
import { PiNewspaperClipping } from "react-icons/pi";
import { GiReceiveMoney } from "react-icons/gi";
import { IoCardSharp } from "react-icons/io5";
import { FaKey } from "react-icons/fa";
import { MdTransferWithinAStation } from "react-icons/md";
import { MdPhoneAndroid } from "react-icons/md";
import { MdQrCode } from "react-icons/md";

const RootTemplate = ({children}) => {

  const {user} = useMainContext()
  const [loading,setLoading] = useState(true)

const router = useRouter()
const pathname = usePathname()
const isToggle = useSelector(SidebarSlicePath)
const dispatch = useDispatch()
  
useEffect(()=>{
  if(!user){
    router.push("/login")
  } else if(user.kyc_status !== 'verified' && pathname !== '/kyc'){
    // Redirect un-verified users to KYC page so they cannot access banking features
    router.push('/kyc')
  } else {
    setLoading(false)
  }
},[user, router, pathname])

if(loading){
  return <div className='min-h-screen flex items-center justify-center'>
    <Loader/>
  </div>
}

const CustomMenu = ({link,text,Icon})=>{
  const pathname= usePathname()
  return <>
  <MenuItem
  style={{
    background:pathname === link?'#c60036':'#ffff',
    color:pathname === link?'white':'black',
    borderRadius:pathname === link?"10px":'0px'
  }}
  icon={<Icon className="text-2xl" />}
  component={<Link href={link} />}> {text} </MenuItem>
  </>
}

  return (
    <>  
        <section className="flex items-start">
          {/* Sidebar */}
          <AppSidebar isOpen={isToggle} onClose={() => dispatch(setIsToggle())} />

          {/* Content */}
          <main className='px-1 md:px-3 w-full lg:ml-64'>
            <PageFade>{children}</PageFade>
          </main>
        </section>
    </>
  )
}

export default RootTemplate