import React, { useState } from "react";
import { sitelogo } from "../assets/images/Images";
import { AlignRight, DiamondPlus, SquarePen, Trash2 } from "lucide-react";
import "../assets/styles/SideBar.css";

const SideBar = ({ selectedChat, setSelectedChat, chats, setChats }) => {
  const [isMobile, setIsMobile] = useState(false);

  const handleDelete = (Id) => {
    const newChats = chats.filter((chat) => chat.id !== Id);
    setChats(newChats);
    setSelectedChat(null);
    setIsMobile(false);
    localStorage.setItem("chatsList", JSON.stringify(newChats));
  };

  const handleNewChat = () => {
    const existingChats = JSON.parse(localStorage.getItem("chatsList")) || [];
    const lastChat = existingChats[existingChats.length - 1];
    if (lastChat && lastChat.title === "New chat") return;
    const newId = lastChat ? lastChat.id + 1 : 1;
    const newChatData = { id: newId, title: "New chat", Chats: [] };
    const newChats = [...existingChats, newChatData];
    setChats(newChats);
    setIsMobile(false);
    localStorage.setItem("chatsList", JSON.stringify(newChats));
    setSelectedChat(newId);
  };

  if (!chats || chats.length === 0) {
    return (
      <>
        <div className="mobile-nav">
          <div
            onClick={() => {
              window.location = "/";
              console.log("clicked");
            }}
          >
            Smart <span>Mind</span>
          </div>
          <div
            onClick={() => {
              setIsMobile(true);
            }}
          >
            <AlignRight />
          </div>
        </div>
        <div
          className={`sidebar-container ${isMobile ? "sidebar-vissible" : ""}`}
        >
          <div className="sidebar-header-container">
            <div
              className="sidebar-header"
              onClick={() => {
                window.location = "/";
              }}
            >
              <img src={sitelogo} />
              <h2>Smart Mind</h2>
            </div>
            <div
              onClick={() => {
                setIsMobile(false);
              }}
              className="close-sidebar-icon"
            >
              <DiamondPlus />
            </div>
          </div>
          <div onClick={handleNewChat} className="sidebar-new-chat-container">
            <SquarePen />
            New chat
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mobile-nav">
        <div
          onClick={() => {
            window.location = "/";
          }}
        >
          Smart <span>Mind</span>
        </div>
        <div
          onClick={() => {
            setIsMobile(true);
          }}
        >
          <AlignRight />
        </div>
      </div>
      <div
        className={`sidebar-container ${isMobile ? "sidebar-vissible" : ""}`}
      >
        <div className="sidebar-header-container">
          <div
            className="sidebar-header"
            onClick={() => {
              window.location = "/";
            }}
          >
            <img src={sitelogo} />
            <h2>Smart Mind</h2>
          </div>
          <div
            onClick={() => {
              setIsMobile(false);
            }}
            className="close-sidebar-icon"
          >
            <DiamondPlus />
          </div>
        </div>
        <div onClick={handleNewChat} className="sidebar-new-chat-container">
          <SquarePen />
          New chat
        </div>
        <div className="sidebar-chats-container">
          <div className="sidebar-chats-label-header">Chats</div>
          {chats.length > 0 &&
            [...chats].reverse().map((chat) => (
              <div
                className={`sidebar-chat ${
                  selectedChat === chat.id ? "active" : ""
                }`}
                onClick={() => {
                  setIsMobile(false);
                  setSelectedChat(chat.id);
                }}
                key={chat.id}
              >
                <h3>{chat.title}</h3>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2
                    onClick={() => {
                      handleDelete(chat.id);
                    }}
                    className="delete-chat-icon"
                    size={20}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default SideBar;
