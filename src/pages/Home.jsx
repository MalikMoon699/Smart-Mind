import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Chat from "../components/Chat";

const Home = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState(null);

  useEffect(() => {
    const chatsList = JSON.parse(localStorage.getItem("chatsList")) || [];
    setChats(chatsList);
  }, []);

useEffect(() => {
  if (selectedChat) {
    window.location.hash = `#${selectedChat}`;
  }
}, [selectedChat]);


  return (
    <div className="main-container">
      <SideBar
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chats={chats}
        setChats={setChats}
      />
      <Chat
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chats={chats}
        setChats={setChats}
      />
    </div>
  );
};

export default Home;
