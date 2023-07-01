import {createContext,useMemo,useContext} from 'react';


import { io } from "socket.io-client";

export const SocketContext = createContext(null);


export const SocketProvider = ({children}) =>{
    
    const socket = useMemo(()=>io("https://trhmr7-8000.csb.app"),[]);
    
    return(
        <SocketContext.Provider value={socket} >
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () =>{
    const socket = useContext(SocketContext);
    return socket;
}
