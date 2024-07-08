import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import useApiRequest from "../../lib/apiRequest";

import {format} from "timeago.js"
import { SocketContext } from "../../context/SocketContextx";
import { useNotificationStore } from "../../lib/notificationStore";

function Chat({ chats }) {
  const [chat, setChat] = useState(null);
  const {currentUser} = useContext(AuthContext)
  const {socket} = useContext(SocketContext)
  const apiRequest = useApiRequest()
  const notificationStore = useNotificationStore()

  const messageEndRef = useRef()

  const decrease = notificationStore((state)=>state.decrease)
  
  useEffect(()=>{
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth"
    })
  },[chat])

  const handleOpenChat = async (id, reciever) =>{
    try { 
      const res = await apiRequest.get("/chats/" + id)
      if(!res.data.seenBy.includes(currentUser.id)){
        decrease()
      }
      setChat({...res.data, reciever})
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const  formData = new FormData(e.target);
    const text = formData.get("text")

    if(!text) return;
    try {
      const res = await apiRequest.post("/messages/" + chat.id, {
        text,
      },{
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      })
      setChat(prev => ({...prev, messages: [...prev.messages, res.data]}))
      e.target.reset()
      socket.emit("sentMessage", {
        recieverId : chat.reciever.id,
        data: res.data,
      })

    } catch (error) {
      console.log(error)
    }

  }

  useEffect(()=>{

    const read = async ()=>{
      try {
        await apiRequest.put("/chats/read"+ chat.id,{},{
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          }
        })
      } catch (error) {
        console.log(error)
      }
    }

    if(chat && socket) {
      socket.on("getMessage" ,(data)=>{
        if(chat.id === data.chatId){
          setChat(prev => ({...prev, messages: [...prev.messages, data]}))
          read();
        }
      });
      return () => {
        socket.off("getMessage")
      };
    }
  }, [apiRequest, chat, socket])
  

  return (
    <div className="chat">
      <div className="messages">
        {chats?.map((c) => (
          <div className="message" key={c.id}
          style={{
            backgroundColor: c.seenBy.includes(currentUser.id) || chat?.id === c.id ? "white" : "#fecd514e",
          }}
          onClick={()=>handleOpenChat(c.id, c.reciever) }
          >
            <img src={c.reciever.avatar || "/noavatar.jpg"} alt="" />
            <span>{c.reciever.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src={chat.reciever.avatar || "/noavatar.jpg"}
                alt=""
              />
              {chat.reciever.username}
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className="center">
            {
              chat.messages.map(message=>(

                <div className="chatMessage" 
                style={{
                  alignSelf: message.userId === currentUser.id ? "flex-end" : "flex-start",
                  textAlign: message.userId.id === currentUser.id ? "right" : "left",
                }}
                key={message.id} 
                >
              <p>{message.text}</p>
              <span>{format(message.createdAt)}</span>
                </div>
              ))}
              <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
