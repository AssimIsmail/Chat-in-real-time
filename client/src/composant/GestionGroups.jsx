import React, { useEffect, useState } from "react";
import { faArrowLeft, faSearch, faTimes, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const GestionGroups = ({ userId, onBack }) => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupCreationError, setGroupCreationError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/contacts/${userId}`
        );
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (err) {
        console.error("Error fetching contacts:", err);
        // Handle error state if needed
      }
    };

    fetchContacts();
  }, [userId]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setIsSearching(event.target.value.length > 0);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  const filteredContacts = contacts?.friends?.filter(
    ({ friend }) =>
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSelectConversation = (_id, friend) => {
    console.log("Selected conversation:", _id, friend);
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleGroupNameChange = (event) => {
    setGroupName(event.target.value);
  };

  const createGroup = async () => {
    try {
      setCreatingGroup(true);
      const response = await fetch("http://localhost:3000/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          participants: selectedUsers,
          userId: userId, // Ajout du userId dans le corps de la requête
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create group");
      }
      // Reset state after successful creation
      setGroupName("");
      setSelectedUsers([]);
      setGroupCreationError(null);
      alert("Group created successfully!"); // Replace with proper UI feedback
    } catch (error) {
      console.error("Error creating group:", error);
      setGroupCreationError("Failed to create group. Please try again.");
    } finally {
      setCreatingGroup(false);
    }
  };
  

  return (
    <div className="p-4 bg-white max-h-screen overflow-y-auto relative">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-blue-500 flex items-center focus:outline-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span>Retour</span>
        </button>
      </div>
      <div className="relative mb-4 flex items-center">
        <input
          type="text"
          value={groupName}
          onChange={handleGroupNameChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-blue-500 transition-all duration-300"
          placeholder="Nom du groupe..."
        />
        <button
          onClick={createGroup}
          disabled={selectedUsers.length === 0 || groupName.trim() === "" || creatingGroup}
          className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2 disabled:opacity-50 flex items-center"
        >
          {creatingGroup ? "Création en cours..." : (
            <>
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Créer
            </>
          )}
        </button>
      </div>
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
          className={`absolute left-3 top-3 cursor-pointer text-gray-600 ${
            isSearching ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          onClick={isSearching ? clearSearch : () => {}}
        />
      </div>
      {filteredContacts.length > 0 ? (
        filteredContacts.map(({ friend, _id }) => (
          <div
            key={_id}
            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelectConversation(_id, friend)}
          >
            <input
              type="checkbox"
              checked={selectedUsers.includes(friend._id)}
              onChange={() => toggleUserSelection(friend._id)}
              className="mr-4"
            />
            <img
              src={friend.image || "https://via.placeholder.com/150"}
              alt={friend.displayName}
              className="w-10 h-10 rounded-full object-cover mr-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <div className="flex-1">
              <h2 className="text-sl font-semibold text-gray-900">
                {friend.displayName}
              </h2>
            </div>
          </div>
        ))
      ) : (
        <p>No contacts found.</p>
      )}
      {groupCreationError && (
        <p className="text-red-500 mt-2">{groupCreationError}</p>
      )}
    </div>
  );
};

export default GestionGroups;
