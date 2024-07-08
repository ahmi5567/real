import axios from "axios";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
import { getCookie } from "../utils/getCookie";

const useApiRequest = () => {

  const apiRequest = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getCookie('token')}`
    },
  });


  apiRequest.interceptors.request.use(
    (config) => {
      const token = getCookie('token'); // Retrieve the token from the cookie
      console.log('Retrieved token:', token); // Log the token
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Set the token in the headers
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiRequest;
};

export const apiRequest = async (url, options = {}) => {
  const response = await axios({
    url: `${import.meta.env.VITE_BACKEND_URL}/api${url}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getCookie('token')}`
    },
    ...options
  });
  return response;
};

export default useApiRequest;