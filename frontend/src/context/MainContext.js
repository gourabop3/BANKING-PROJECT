"use client";
import Loader from "@/components/Loader";
import { axiosClient } from "@/utils/AxiosClient";
import { toast } from "react-toastify";

// const { createContext, useContext, useState, useEffect } = require("react");
import {createContext, useContext, useState, useEffect} from 'react'
import { useRouter } from "next/navigation";

const mainContext = createContext({
    user: {},
    loading: true,
    fetchUserProfile() {},
    LogoutHandler() {},
    fetchATMDetails() {},
    atm: {},
})

export const useMainContext = ()=> useContext(mainContext)

export const MainContextProvider = ({children})=>{

    const [user,setUser] = useState(null)
    const [loading,setLoading] = useState(true)
    const router = useRouter()

    const [atm,setAtm] = useState(null)
    // to fetch user profile 
    const fetchUserProfile = async()=>{

        try {
            const token = localStorage.getItem("token") || ''
            if (!token) {
                // No token means user is not authenticated; stop loading state
                setLoading(false);
                return;
            }
            const response = await axiosClient.get('/auth/profile',{
                headers:{
                    'Authorization':'Bearer '+ token
                }
            })
            const data  = await response.data
            console.log(data)
            setUser(data)


        } catch (error) {
            toast.error(error.response.data.msg || error.message)
        }finally{
            setLoading(false)
        }
    }


    const fetchATMDetails = async(id)=>{

        try {
        
            if(!id){
                return
            }
            const response = await axiosClient.get(`/atm-card/get/${id}`,{
                headers:{
                    'Authorization':'Bearer '+ localStorage.getItem("token")
                }
            })
            const data  = await response.data  
            setAtm(data)


        } catch (error) {
            console.log(error)
            toast.error(error.response.data.msg || error.message)
        } 
    }
    const LogoutHandler = ()=>{
        localStorage.removeItem("token")
        localStorage.removeItem("admin_token")
        setUser(null)
        toast.success("Logout Success")
        // Use hard navigation to clear any lingering state that may cause client-side exceptions
        window.location.href = "/login";
    }


    useEffect(()=>{
        fetchUserProfile()
    },[])

    if(loading){
            return <div className="min-h-screen flex items-center justify-center w-full">
                <Loader/>
            </div>
    }

    return (
        <mainContext.Provider
            value={{
                user,
                loading,
                fetchUserProfile,
                LogoutHandler,
                fetchATMDetails,
                atm,
            }}
        >
            {children}
        </mainContext.Provider>
    )
}