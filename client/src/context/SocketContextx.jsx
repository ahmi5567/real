import { createContext, useContext, useEffect, useState } from "react";
import {io} from 'socket.io-client'
import { AuthContext } from "./AuthContext";
export const SocketContext = createContext()

export const SocketContextProvider = ({children}) => {
  const {currentUser} = useContext(AuthContext)
  const [socket, setSocket] = useState(null);
  
  
  useEffect(() => {
    
    setSocket(io(`${import.meta.env.VITE_BACKEND_URL}`, {
      withCredentials:true,
      methods: ["GET", "POST"],
      transports: ["websocket", "polling"],
    }))
  }, []);

  useEffect(()=>{
    if (currentUser && socket) {
      socket.emit("newUser", currentUser.id);
    }
  }, [currentUser ,socket])

  return <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
}