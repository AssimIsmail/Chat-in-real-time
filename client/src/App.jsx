import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useRequireAuth from './context/useRequireAuth';
import Contacts from './composant/Contacts';
import Conversation from './composant/Conversation';
import RequestFriend from './composant/RequestFriend';
import './index.css';
import { CSSTransition } from 'react-transition-group';
import GestionGroups from './composant/GestionGroups';
import GroupConver from './composant/GroupConver'; // Import du nouveau composant GroupConver

function App() {
  const isAuthenticated = useRequireAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null); // Nouvel état pour le groupe sélectionné
  const [showRequestFriend, setShowRequestFriend] = useState(false);
  const [showGestionGroups, setShowGestionGroups] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/profile', {
          withCredentials: true,
        });
        setCurrentUser(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('Utilisateur non authentifié. Redirection vers la page de connexion.');
          window.location.href = '/';
        } else {
          console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error);
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  const handleSelectConversation = (conversationId, contact) => {
    setSelectedConversationId(contact._id);
    setSelectedGroupId(null); // Assurez-vous que le groupe sélectionné est effacé lorsque vous sélectionnez une conversation
    console.log('Selected contact:', contact);
  };

  const handleRequestFriend = () => {
    setShowRequestFriend(true);
  };

  const handleBackToContacts = () => {
    setShowRequestFriend(false);
    setShowGestionGroups(false);
  };

  const handleCreateGroup = () => {
    setShowGestionGroups(true);
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
    setSelectedConversationId(null); // Assurez-vous que la conversation sélectionnée est effacée lorsque vous sélectionnez un groupe
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 p-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <h1>Chargement...</h1>
        </div>
      ) : currentUser ? (
        <div className="flex h-full">
          <div className="w-1/3 bg-white border-r border-gray-300 shadow-lg relative">
            <CSSTransition
              in={!showRequestFriend && !showGestionGroups}
              timeout={300}
              classNames="fade"
              unmountOnExit
            >
              <Contacts
                userId={currentUser._id}
                user={currentUser}
                onSelectConversation={handleSelectConversation}
                onRequestFriend={handleRequestFriend}
                onCreateGroup={handleCreateGroup}
                onLogout={handleLogout}
                onBack={handleBackToContacts}
                onSelectGroup={handleSelectGroup} // Ajout de la fonction de sélection de groupe
              />
            </CSSTransition>
            <CSSTransition
              in={showRequestFriend}
              timeout={300}
              classNames="fade"
              unmountOnExit
            >
              <RequestFriend userId={currentUser._id} onBack={handleBackToContacts} />
            </CSSTransition>
            <CSSTransition
              in={showGestionGroups}
              timeout={300}
              classNames="fade"
              unmountOnExit
            >
              <GestionGroups userId={currentUser._id} onBack={handleBackToContacts} />
            </CSSTransition>
          </div>
          <div className="flex-1 bg-gray-50">
            {selectedConversationId && !selectedGroupId ? (
              <Conversation
                userId={currentUser._id}
                user={currentUser}
                contactId={selectedConversationId}
              />
            ) : selectedGroupId && !selectedConversationId ? (
              <GroupConver userId={currentUser._id} groupId={selectedGroupId} />
            ) : (
              <div className="text-center text-gray-500">
                <h2>Sélectionnez une conversation pour commencer à discuter ou un groupe pour voir les détails</h2>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <h1>Utilisateur non authentifié. Redirection vers la page de connexion...</h1>
        </div>
      )}
    </div>
  );
}

export default App;
