import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const Conversation = ({ contactId, userId, user }) => {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageListRef = useRef(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/conversation/${userId}/${contactId}`
        );
        setConversation(response.data.conversation);
    
        if (response.data.conversation) {
          console.log(response.data.conversation._id)

          const messagesResponse = await axios.get(
            `http://localhost:3000/api/messages/${response.data.conversation._id}/messages`
          );
          setMessages(messagesResponse.data);
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (contactId && userId) {
      fetchConversation();
    }
  }, [contactId, userId,messages]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      if (conversation) {
        newSocket.emit("joinConversation", conversation._id);
      }
    });

    newSocket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [conversation]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/conversation/${conversation._id}/message`,
        {
          content: newMessage,
          senderId: userId,
          receiverId: contactId,
        }
      );

      socket.emit("message", response.data);

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!conversation) return <p>No conversation found.</p>;

  const contact = conversation.participants.find(
    (participant) => participant._id === contactId
  );

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="bg-white p-4 flex items-center">
        <img
          src={contact.image || "https://via.placeholder.com/150"}
          alt={contact.displayName}
          className="w-8 h-8 rounded-full object-cover mt-1 ml-2"
        />
        <span className="pl-4">{contact.displayName}</span>
      </div>

      <div ref={messageListRef} className="flex-1 p-4 overflow-y-auto bg-stone-50">
        {messages.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <li
                key={index}
                className={`flex ${
                  message.sender && message.sender === userId
                    ? "justify-end self-end"
                    : "justify-start self-start"
                }`}
                style={{ marginBottom: "10px" }}
              >
                <div className="flex items-end">
                  {message.sender && message.sender !== userId && (
                    <img
                      src={contact.image || "https://via.placeholder.com/150"}
                      alt={contact.displayName}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                      style={{ order: "0" }}
                    />
                  )}
                  <div className="max-w-xs">
                    <p
                      className={`bg-${
                        message.sender && message.sender === userId ? "blue" : "white"
                      } rounded-lg p-2 shadow mb-1 text-sm text-gray-800`}
                    >
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  {message.sender && message.sender === userId && (
                    <img
                      src={user.image || "https://via.placeholder.com/150"}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover ml-2"
                      style={{ order: "1" }}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p></p>
        )}
      </div>

      <form onSubmit={handleMessageSubmit} className="bg-white p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 mr-2 p-2 rounded border border-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;
