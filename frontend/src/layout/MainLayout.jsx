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
  
  // Define admin pages and auth pages that should not show user navbar/sidebar
  const isAdminPage = pathname.startsWith('/admin-dashboard') || pathname.startsWith('/admin-login');
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // Hide navbar on auth pages and admin pages
  const hideNavbar = isAuthPage || isAdminPage;
  const hideSidebar = hideNavbar || pathname.startsWith('/admin');
  return (
    <Provider store={store}>
    <MainContextProvider>
    <ToastContainer/>
    <ErrorBoundary>
      {!hideNavbar && <Navbar/>}
      <div className="flex">
        {/* Sidebar */}
        {!hideSidebar && <AppSidebar />}
        {/* Main content */}
        <div className="flex-1">{children}</div>
      </div>
    </ErrorBoundary>
    </MainContextProvider>
    </Provider>
  )
}

export default MainLayout