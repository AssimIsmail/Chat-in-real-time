import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faEllipsisV, faCheck, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Contacts = ({ userId, user, onSelectConversation, onRequestFriend, onLogout, onCreateGroup, onSelectGroup }) => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [errorContacts, setErrorContacts] = useState(null);
  const [errorGroups, setErrorGroups] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [addFriendError, setAddFriendError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  const [showGroups, setShowGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null); // Nouveau state pour l'ID du groupe sélectionné

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/contacts/${userId}`);
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (err) {
        setErrorContacts(err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, [userId]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/groups/participant/${userId}`);
        const data = await response.json();
        setGroups(data || []);
      } catch (err) {
        setErrorGroups(err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setIsSearching(event.target.value.length > 0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  const startAddingFriend = () => {
    setIsAddingFriend(true);
    setShowDropdown(false);
  };

  const cancelAddingFriend = () => {
    setIsAddingFriend(false);
    setNewFriendName('');
    setAddFriendError(null);
  };

  const confirmAddFriend = async () => {
    setAddFriendError(null);
    try {
      const response = await fetch('http://localhost:3000/api/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requesterEmail: user.email, recipientEmail: newFriendName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de l\'ajout de l\'ami');
      }

      console.log('Ajout de l\'ami:', newFriendName);
      setIsAddingFriend(false);
      setNewFriendName('');
      const updatedContacts = await fetch(`http://localhost:3000/api/contacts/${userId}`).then((res) => res.json());
      setContacts(updatedContacts.contacts || []);
    } catch (error) {
      setAddFriendError(error.message);
    }
  };

  const handleNewFriendNameChange = (event) => {
    setNewFriendName(event.target.value);
  };

  const filteredContacts = contacts?.friends?.filter(({ friend }) =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleShowContacts = () => {
    setShowContacts(true);
    setShowGroups(false);
  };

  const handleShowGroups = () => {
    setShowContacts(false);
    setShowGroups(true);
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId); // Met à jour l'ID du groupe sélectionné
    onSelectGroup(groupId); // Appelle la fonction onSelectGroup passée en props
  };

  return (
    <div className="p-4 bg-white max-h-screen overflow-y-auto relative">
      <div className="flex items-center mb-4 relative">
        <img
          src={user.image}
          alt={user.displayName}
          className="w-12 h-12 rounded-full object-cover mr-4 cursor-pointer"
          onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150"; }}
          onClick={onRequestFriend}
        />
        {isAddingFriend && (
          <div className="flex items-center w-full mr-4">
            <input
              type="text"
              value={newFriendName}
              onChange={handleNewFriendNameChange}
              placeholder="Entrez l'email de l'ami..."
              className="w-full md:w-80 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:border-blue-500 transition-all duration-300"
            />
            <FontAwesomeIcon
              icon={faCheck}
              className="ml-2 text-green-500 cursor-pointer"
              onClick={confirmAddFriend}
            />
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="ml-2 text-red-500 cursor-pointer"
              onClick={cancelAddingFriend}
            />
          </div>
        )}
        <div className="ml-auto relative" ref={dropdownRef}>
          <FontAwesomeIcon
            icon={faEllipsisV}
            className="text-gray-600 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10">
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={startAddingFriend}
              >
                Ajouter amis
              </div>
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={onCreateGroup}
              >
                Créer groupe
              </div>
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={onLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
      {addFriendError && (
        <p className="text-red-500 mt-2 text-sm transition-opacity duration-500 ease-in-out transform">{addFriendError}</p>
      )}

      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsSearching(true)}
          onBlur={() => setIsSearching(searchTerm.length > 0)}
          className="w-full p-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:border-blue-500 transition-all duration-300"
          placeholder="Rechercher des contacts..."
        />
        <FontAwesomeIcon
          icon={isSearching ? faTimes : faSearch}
          className={`absolute left-3 top-3 cursor-pointer text-gray-600 ${isSearching ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onClick={isSearching ? clearSearch : () => {}}
        />
      </div>

      <div className="flex mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded-md focus:outline-none ${showContacts ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={handleShowContacts}
        >
          Contacts
        </button>
        <button
          className={`px-4 py-2 rounded-md focus:outline-none ${showGroups ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={handleShowGroups}
        >
          Groupes
        </button>
      </div>

      {loadingContacts || loadingGroups ? (
        <p className="text-gray-900">Chargement...</p>
      ) : showContacts ? (
        contacts.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-xl font-semibold text-gray-700 text-center">Aucun contact trouvé. Ajoutez des amis pour commencer à discuter !</p>
          </div>
        ) : (
          filteredContacts.length > 0 ? (
            filteredContacts.map(({ friend, _id }) => (
              <div 
                key={_id} 
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectConversation(_id, friend)}
              >
                <img
                  src={friend.image}
                  alt={friend.displayName}
                  className="w-10 h-10 rounded-full object-cover mr-4"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150"; }}
                />
                <div className="flex-1">
                  <h2 className="text-sl font-semibold text-gray-900">{friend.displayName}</h2>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-900">Aucun contact trouvé.</p>
          )
        )
      ) : (
        groups.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-xl font-semibold text-gray-700 text-center">Aucun groupe trouvé.</p>
          </div>
        ) : (
          groups.map(group => (
            <div 
              key={group._id} 
              className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedGroupId === group._id ? 'bg-blue-200' : ''}`}
              onClick={() => handleSelectGroup(group._id)}
            >
              <h2 className="text-sl font-semibold text-gray-900">{group.name}</h2>
              <p>{group.participants.join(', ')}</p>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default Contacts;
