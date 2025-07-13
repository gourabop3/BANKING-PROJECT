import Link from 'next/link'
import React from 'react'

const NotValidUser = () => {
  return (
    <div className='w-full py-10 rounded-md shadow border my-10 flex flex-col justify-center items-center'>
        <img src="https://cdn2.iconfinder.com/data/icons/security-382/999/Not_Verified_Unverified_Status_Verify_Pending-512.png" alt="" className='w-[300px] h-[300px] object-cover' />
        <h1 className='text-center text-4xl font-black pb-4 pt-2'>Please Complete Your Profile</h1>
      <div className="flex justify-center">
          <Link href={'/profile'} className='text-white text-center px-6 py-3 rounded-sm bg-rose-700 hover:bg-rose-800 transition-all duration-300 '>Click Here </Link>
      </div>
    </div>
  )
}

export default NotValidUser