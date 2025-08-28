import React, { useEffect, useState, useRef } from "react";
import "../assets/styles/Chat.css";
import { Copy } from "lucide-react";
import { sitelogo } from "../assets/images/Images";
import { API_URL } from "../Utils/Constants";
import { toast } from "react-toastify";
import Loader from "./Loader";
import FormatResponse from "../Utils/FormatResponse";

const Chat = ({ selectedChat, setSelectedChat, chats, setChats }) => {
  const [chatsData, setChatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const getChat = chats?.find((chat) => chat.id === selectedChat) || null;
    setChatsData(getChat);
  }, [selectedChat, chats]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [chatsData?.Chats]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const formatTitle = (text) => {
    let trimmed = text.trim().replace(/[.?!]/g, "");
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };


  const handleAsk = async () => {
    if (!question.trim()) return;
     const updatedChats = chats.map((chat) => {
       if (chat.id === selectedChat) {
         const isFirstMessage = chat.Chats.length === 0;
         const addTitle = formatTitle(question.slice(0, 30));
         const newTitle = isFirstMessage
           ? addTitle === "New chat"
             ? "Latest chat"
             : addTitle
           : chat.title;


         return {
           ...chat,
           title: newTitle,
           Chats: [...chat.Chats, { sender: "you", text: question }],
         };
       }
       return chat;
     });

     setChats(updatedChats);
     localStorage.setItem("chatsList", JSON.stringify(updatedChats));



    const currentQuestion = question;
    setQuestion("");
    const textarea = document.querySelector(".chat-textarea");
    if (textarea) {
      textarea.style.height = "45px";
    }
    try {
      setLoading(true);
      const payload = {
        contents: [{ parts: [{ text: currentQuestion }] }],
      };

      let response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      response = await response.json();

      const aiReply =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";

      const updatedWithAI = updatedChats.map((chat) => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            Chats: [...chat.Chats, { sender: "ai", text: aiReply }],
          };
        }
        return chat;
      });

      setChats(updatedWithAI);
      localStorage.setItem("chatsList", JSON.stringify(updatedWithAI));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching AI:", error);
    }
  };

  return (
    <div className="chat-container">
      {selectedChat === null ? (
        <div className="no-selected-chat">
          <img src={sitelogo} alt="logo" />
          <h2>Smart Mind</h2>
        </div>
      ) : (
        chatsData && (
          <>
            <div className="chat-content">
              {Array.isArray(chatsData?.Chats) &&
                chatsData.Chats.map((message, index) =>
                  message.sender === "you" ? (
                    <div key={index} className="my-chat">
                      <div className="chat-same">
                        <p>{message.text}</p>
                        <div className="chat-options">
                          <span onClick={() => handleCopy(message.text)}>
                            <Copy size={15} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="ai-chat">
                      <div className="chat-same">
                        <FormatResponse text={message.text} />
                        <div className="chat-options">
                          <span onClick={() => handleCopy(message.text)}>
                            <Copy size={15} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              {loading && (
                <div className="ai-chat">
                  <div className="chat-same">
                    <Loader loading={true} className="chat-loader" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="send-container">
              <div>
                <textarea
                  className="chat-textarea"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    e.target.style.height = "45px";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      300
                    )}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  style={{ minHeight: "45px", maxHeight: "300px" }}
                  placeholder="Ask anything"
                />

                <button className="send-btn" onClick={handleAsk}>
                  Ask
                </button>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Chat;
