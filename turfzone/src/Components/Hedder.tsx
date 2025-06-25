import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUserName } from "../services/api";

import "./Hedder.css";
import EditIcon from "../assets/edit.svg";
import Login from "../assets/loginicon.png";
import logo from "../assets/logo.png";

function Hedder() {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuth();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get username from authenticated user or localStorage
  const getDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }

    // Fallback to localStorage data
    try {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        const parsedUser = JSON.parse(localUser);
        return parsedUser.username || parsedUser.name || "User";
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    return "Guest";
  };

  const [username, setUsername] = useState(() => getDisplayName());
  const [nameInput, setNameInput] = useState(username);

  // Update username when user authentication state changes
  useEffect(() => {
    const newUsername = getDisplayName();
    setUsername(newUsername);
    setNameInput(newUsername);
  }, [currentUser]);

  // Listen for user login events to update the header
  useEffect(() => {
    const handleUserLogin = () => {
      const newUsername = getDisplayName();
      setUsername(newUsername);
      setNameInput(newUsername);
    };

    const handleUserLogout = () => {
      setUsername("Guest");
      setNameInput("Guest");
      setDropdownVisible(false);
      setIsEditing(false);
    };

    window.addEventListener("userLogin", handleUserLogin);
    window.addEventListener("userLogout", handleUserLogout);

    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
      window.removeEventListener("userLogout", handleUserLogout);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (nameInput.trim()) {
      const trimmedName = nameInput.trim();

      // First update the UI immediately for a responsive feel
      setUsername(trimmedName);

      try {
        // Update localStorage if user is authenticated
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const parsedUser = JSON.parse(localUser);
          const phoneNumber = parsedUser.phone || currentUser?.phoneNumber;

          // Update username in localStorage
          parsedUser.username = trimmedName;
          localStorage.setItem("user", JSON.stringify(parsedUser));

          // If we have a phone number, also update the name in the backend
          if (phoneNumber) {
            try {
              console.log(
                `📝 Updating user name in backend: ${trimmedName} for phone ${phoneNumber}`
              );
              const result = await updateUserName(phoneNumber, trimmedName);
              console.log("✅ Name updated successfully in backend:", result);
            } catch (apiError) {
              console.error("Failed to update name in backend:", apiError);
              // We don't show this error to the user as the local update was successful
            }
          }
        }
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }

    // Hide the edit form regardless of outcome
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();

      // Reset UI state
      setUsername("Guest");
      setNameInput("Guest");
      setDropdownVisible(false);
      setIsEditing(false);

      // Trigger logout event to ensure all components update properly
      window.dispatchEvent(new Event("userLogout"));

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force navigation even if logout fails
      setDropdownVisible(false);
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="nav">
      <img src={logo} alt="Logo" className="logo" />

      {currentUser ? (
        // Show profile section for authenticated users
        <div className="profile-section" ref={dropdownRef}>
          <div className="avatar-circle large" onClick={toggleDropdown}>
            {username?.charAt(0).toUpperCase()}
          </div>

          {dropdownVisible && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="avatar-circle">{username.charAt(0)}</div>

                {isEditing ? (
                  <div className="edit-name-section">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSave();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setIsEditing(false);
                          setNameInput(username);
                        }
                      }}
                      placeholder="Enter your name"
                      maxLength={30}
                      autoFocus
                      className="edit-name-input"
                    />
                    <div className="edit-buttons">
                      <img
                        src={EditIcon}
                        alt="Save"
                        className="edit-icon"
                        onClick={handleSave}
                        title="Save (Enter)"
                        style={{ opacity: nameInput.trim() ? 1 : 0.5 }}
                      />
                      <button
                        className="cancel-edit"
                        onClick={() => {
                          setIsEditing(false);
                          setNameInput(username);
                        }}
                        title="Cancel (Esc)"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="name-display">
                    <span className="display-name" title="Click to edit">
                      {username}
                    </span>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="edit-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setNameInput(username);
                      }}
                      title="Edit name"
                    />
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div className="logout-btn" onClick={handleLogout}>
                <img src={Login} alt="Logout" className="logout-icon" />
                Log out
              </div>
            </div>
          )}
        </div>
      ) : (
        // Show login button for unauthenticated users
        <div className="login-section">
          <button
            className="login-button"
            onClick={() => navigate("/login")}
            title="Login"
          >
            <img src={Login} alt="Login" className="login-icon" />
            Login
          </button>
        </div>
      )}
    </nav>
  );
}

export default Hedder;
