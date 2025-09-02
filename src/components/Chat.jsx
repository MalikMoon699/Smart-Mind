import React, { useEffect, useState, useRef } from "react";
import "../assets/styles/Chat.css";
import { Copy, Plus, X } from "lucide-react";
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
  const [pendingImages, setPendingImages] = useState([]);

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
    if (!question.trim() && pendingImages.length === 0) return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChat) {
        const isFirstMessage = chat.Chats.length === 0;
        const addTitle = formatTitle((question || "Image").slice(0, 25));
        const newTitle = isFirstMessage
          ? addTitle === "New chat"
            ? "Latest chat"
            : `${addTitle}...`
          : chat.title;

        return {
          ...chat,
          title: newTitle,
          Chats: [
            ...chat.Chats,
            {
              sender: "you",
              text: question || null,
              images: pendingImages.length ? pendingImages : null,
            },
          ],
        };
      }
      return chat;
    });

    setChats(updatedChats);
    localStorage.setItem("chatsList", JSON.stringify(updatedChats));

    const currentQuestion = question;
    setQuestion("");
    setPendingImages([]);
    const textarea = document.querySelector(".chat-textarea");
    if (textarea) textarea.style.height = "45px";

    try {
      setLoading(true);

      const parts = [];
      if (currentQuestion) {
        parts.push({ text: currentQuestion });
      }
      if (pendingImages.length > 0) {
        pendingImages.forEach((img) => {
          parts.push({
            inlineData: {
              mimeType: "image/png",
              data: img.replace(/^data:image\/\w+;base64,/, ""),
            },
          });
        });
      }

      const payload = { contents: [{ parts }] };

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
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
                        {message.text && <p>{message.text}</p>}
                        <div className="chat-image-sended-container">
                          {message.images &&
                            message.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`upload-${idx}`}
                                className="chat-image"
                              />
                            ))}
                        </div>
                        <div className="chat-options">
                          {message.text && (
                            <span onClick={() => handleCopy(message.text)}>
                              <Copy size={15} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="ai-chat">
                      <div className="chat-same">
                        {message.text && <FormatResponse text={message.text} />}
                        {message.images &&
                          message.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`upload-${idx}`}
                              className="chat-image"
                            />
                          ))}
                        <div className="chat-options">
                          {message.text && (
                            <span onClick={() => handleCopy(message.text)}>
                              <Copy size={15} />
                            </span>
                          )}
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
                {pendingImages.length > 0 && (
                  <div className="input-image-holder">
                    {pendingImages.map((img, index) => (
                      <div key={index}>
                        <span onClick={() => handleRemoveImage(index)}>
                          <X size={16} />
                        </span>
                        <img src={img} alt={`pending-${index}`} />
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="attach-btn"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Plus color="white" />
                </button>
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
                <input
                  type="file"
                  accept="image/*"
                  id="file-upload"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />

                {loading ? (
                  <button
                    className="send-btn"
                    style={{
                      cursor: "not-allowed",
                      backgroundColor: "rgb(89 94 96 / 69%)",
                    }}
                  >
                    Ask
                  </button>
                ) : (
                  <button className="send-btn" onClick={handleAsk}>
                    Ask
                  </button>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Chat;
