import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const GroupConver = ({ userId, groupId }) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageListRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/groups/${groupId}`, {
          withCredentials: true,
        });
        setGroup(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du groupe :', error);
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/groups/${groupId}/messages`, {
          withCredentials: true,
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des messages :', error);
      }
    };

    fetchGroup();
    fetchMessages();
  }, [groupId,newMessage]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      if (groupId) {
        newSocket.emit('joinGroup', groupId);
      }
    });

    newSocket.on('groupMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [groupId]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/messages`,
        {
          sender: userId,
          messageType: 'text',
          content: newMessage,
        },
        {
          withCredentials: true,
        }
      );

      socket.emit('groupMessage', response.data);

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white max-h-screen overflow-y-auto relative">
        <h1>Chargement...</h1>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-4 bg-white max-h-screen overflow-y-auto relative">
        <h1>Groupe non trouvé.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">Groupe sélectionné: {group.name}</h1>
      </div>
      <div ref={messageListRef} className="flex-1 p-4 overflow-y-auto bg-stone-50">
        <ul className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <li
              key={index}
              className={`flex ${
                message.sender && message.sender._id === userId
                  ? 'justify-end self-end'
                  : 'justify-start self-start'
              }`}
              style={{ marginBottom: '10px' }}
            >
              <div className="flex items-end">
                {message.sender && message.sender._id !== userId && (
                  <img
                    src={message.sender.image || 'https://via.placeholder.com/150'}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                )}
                <div className={`max-w-xs p-2 rounded-lg shadow mb-1 text-sm text-gray-800 ${message.sender && message.sender._id === userId ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                  {message.content}
                </div>
                {message.sender && message.sender._id === userId && (
                  <img
                    src={message.sender.image || 'https://via.placeholder.com/150'}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full object-cover ml-2"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form
        className="p-4 bg-white shadow flex items-center"
        onSubmit={handleMessageSubmit}
      >
        <input
          type="text"
          placeholder="Tapez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border border-gray-300 rounded-full px-4 py-2 mr-2"
        />
        <button type="submit" className="text-blue-500 hover:text-blue-700">
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
};

export default GroupConver;
