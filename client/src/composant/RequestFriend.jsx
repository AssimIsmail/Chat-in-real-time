import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const RequestFriend = ({ userId, onBack }) => {
  const [activeSection, setActiveSection] = useState("My Sent Requests");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    const loadFriendRequests = async () => {
      try {
        let response;

        if (activeSection === "My Sent Requests") {
          response = await fetch(`http://localhost:3000/api/friend-requests/requester/${userId}`);
          const data = await response.json();
          const requestsWithEmails = await Promise.all(data.map(async (request) => {
            const userResponse = await fetch(`http://localhost:3000/api/users/${request.recipient}`);
            const userData = await userResponse.json();
            return { ...request, recipientEmail: userData.email };
          }));
          setSentRequests(requestsWithEmails);
        } else if (activeSection === "Requests Received") {
          response = await fetch(`http://localhost:3000/api/friend-requests/recipient/${userId}`);
          const data = await response.json();
          const requestsWithEmails = await Promise.all(data.map(async (request) => {
            const userResponse = await fetch(`http://localhost:3000/api/users/${request.requester}`);
            const userData = await userResponse.json();
            return { ...request, requesterEmail: userData.email };
          }));
          setReceivedRequests(requestsWithEmails);
        } else if (activeSection === "Blocked Users") {
          // Placeholder for fetching blocked users
          // response = await fetch(`http://localhost:3000/api/blocked-users/${userId}`);
          // const data = await response.json();
          // setBlockedUsers(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des demandes d'amitié :", error);
      }
    };

    loadFriendRequests();
  }, [activeSection, userId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "accepted":
        return "bg-green-200 text-green-800";
      case "rejected":
        return "bg-red-200 text-red-800";
      default:
        return "";
    }
  };

  const handleResponse = async (requestId, response) => {
    try {
      const res = await fetch(`http://localhost:3000/api/friend-request/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, response }),
      });

      const result = await res.json();
      if (res.ok) {
        setReceivedRequests(receivedRequests.filter(request => request._id !== requestId));
      } else {
        console.error('Erreur lors de la réponse à la demande d\'amitié:', result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la réponse à la demande d\'amitié:', error);
    }
  };

  return (
    <div className="p-4 bg-white max-h-screen overflow-y-auto">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-blue-500 flex items-center focus:outline-none"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          <span>Retour</span>
        </button>
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-around mb-4">
          <button
            onClick={() => setActiveSection("My Sent Requests")}
            className={`text-lg font-bold px-4 py-2 focus:outline-none ${
              activeSection === "My Sent Requests"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
          >
            Envoyées
          </button>
          <button
            onClick={() => setActiveSection("Requests Received")}
            className={`text-lg font-bold px-4 py-2 focus:outline-none ${
              activeSection === "Requests Received"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
          >
            Reçues
          </button>
          <button
            onClick={() => setActiveSection("Blocked Users")}
            className={`text-lg font-bold px-4 py-2 focus:outline-none ${
              activeSection === "Blocked Users"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
          >
            Bloquées
          </button>
        </div>

        <div
          className={`fade-in-out ${
            activeSection !== "My Sent Requests" ? "hidden" : "block"
          }`}
        >
          <ul>
            {sentRequests.map(request => (
              <li key={request._id} className="flex justify-between items-center mb-2 p-2 border rounded">
                <span><strong>Email:</strong> {request.recipientEmail}</span>
                <span className={`px-2 py-1 rounded ${getStatusStyle(request.status)}`}>
                  {request.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`fade-in-out ${
            activeSection !== "Requests Received" ? "hidden" : "block"
          }`}
        >
          <h5 className="text-xl font-bold mb-4">Requests Received</h5>
          <ul>
            {receivedRequests.map(request => (
              <li key={request._id} className="flex justify-between items-center mb-2 p-2 border rounded">
                <span><strong>Email:</strong> {request.requesterEmail}</span>
                <button
                  onClick={() => handleResponse(request._id, 'accept')}
                  className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleResponse(request._id, 'decline')}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  Refuser
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`fade-in-out ${
            activeSection !== "Blocked Users" ? "hidden" : "block"
          }`}
        >
          <h5 className="text-xl font-bold mb-4">Blocked Users</h5>
          <ul>
            {/* Placeholder for rendering blocked users */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RequestFriend;
