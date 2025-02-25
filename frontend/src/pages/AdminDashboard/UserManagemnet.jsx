import React, { useState, useEffect, useContext } from "react";
import { Search, Edit, Trash2, UserPlus, Mail, Phone } from "lucide-react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import "./UserManagement.css";
import AddUserForm from "./AddUserForm";
import EditUserForm from "./EditUserForm";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { url } = useContext(StoreContext);
  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);
  const [isEditUserFormOpen, setIsEditUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/user/allusers");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:4000/api/user/${userId}`);
        fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditUserFormOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setIsEditUserFormOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="top-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div 
          className="btn-add"
          onClick={() => setIsAddUserFormOpen(true)}
        >
          <UserPlus />
          Add New User
        </div>
      </div>
      
      <AddUserForm
        isOpen={isAddUserFormOpen}
        onClose={() => setIsAddUserFormOpen(false)}
        onUserAdded={() => {
          fetchUsers();
          setIsAddUserFormOpen(false);
        }}
      />

      {selectedUser && (
        <EditUserForm
          isOpen={isEditUserFormOpen}
          onClose={() => {
            setIsEditUserFormOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
          user={selectedUser}
        />
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userID}>
                <td>{user.username}</td>
                <td>
                  <div className="contact-info">
                    <span>
                      <Mail size={14} /> {user.email}
                    </span>
                    <span>
                      <Phone size={14} /> {user.mobile}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="actions">
                  <button 
                      className="btn-icon"
                      onClick={() => handleEditUser(user)}>
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDeleteUser(user.userID)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
