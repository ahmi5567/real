import { createContext, useEffect, useState } from "react";
// import { getCookie } from "../utils/getCookie";

export const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {

  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // const getToken = () => {
  //   const token = getCookie("token");
  //   console.log(token); 
  //   return token;
  // }

  const updateUser = (data) =>{
    setCurrentUser(data)
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return <AuthContext.Provider value={{currentUser , updateUser}}>{children}</AuthContext.Provider>
}