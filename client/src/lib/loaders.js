import { defer } from "react-router-dom";
import {apiRequest} from "./apiRequest"


export const singlePageloader = async ({request, params}) => {
  const res = await apiRequest("/posts/"+params.id,{
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    }
  });
  return res.data; 
}
export const listPageloader = async ({request, params}) => {
  const query = request.url.split("?")[1] 
  const postPromise =  apiRequest("/posts?"+query,{
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    }
  });
  return defer({
    postResponse: postPromise
  }) 
}

export const profilePageloader = async () => {
  const postPromise =  apiRequest("/users/profilePost",{
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    }
  });
  const chatPromise =  apiRequest("/chats",{
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    }
  });
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  }) 
}