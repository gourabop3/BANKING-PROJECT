import { createSlice } from "@reduxjs/toolkit";

// Get initial state from localStorage if available (client-side only)
const getInitialState = () => {
    if (typeof window === 'undefined') {
        return { isToggle: false }; // Server-side default
    }
    
    // Client-side: check screen size
    const isMobile = window.innerWidth < 1024;
    return { 
        isToggle: !isMobile // Desktop: open by default, Mobile: closed by default
    };
};

export const SidebarSlice= createSlice({
    name:'SidebarSlice',
    initialState: getInitialState(),
    reducers:{
        setIsToggle(state,action){
            state.isToggle = !state.isToggle
        },
        setSidebarOpen(state, action) {
            state.isToggle = action.payload
        }
    }
})

export const {setIsToggle, setSidebarOpen} = SidebarSlice.actions

export const SidebarSlicePath = (state)=> state?.SidebarSlice?.isToggle ?? false