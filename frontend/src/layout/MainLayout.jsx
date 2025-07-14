"use client";
import Navbar from '@/components/Navbar'
import { MainContextProvider } from '@/context/MainContext'
import { store } from '@/redux/store'
import React from 'react'
import { Provider } from 'react-redux'
import {ToastContainer} from 'react-toastify'
import ErrorBoundary from '@/components/ErrorBoundary'
import 'react-toastify/dist/ReactToastify.css'
import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/AppSidebar';
const MainLayout = ({children}) => {
  const pathname = usePathname();
  // Hide navbar on login and admin-login pages
  const hideNavbar = pathname === '/login' || pathname === '/admin-login';
  return (
    <Provider store={store}>
    <MainContextProvider>
    <ToastContainer/>
    <ErrorBoundary>
      {!hideNavbar && <Navbar/>}
      <div className="flex">
        {/* Sidebar */}
        {!hideNavbar && <AppSidebar />}
        {/* Main content */}
        <div className="flex-1">{children}</div>
      </div>
    </ErrorBoundary>
    </MainContextProvider>
    </Provider>
  )
}

export default MainLayout