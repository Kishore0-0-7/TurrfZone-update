import { FC } from "react";
import { NavLink } from "react-router-dom";

import DashboardIcon from "../assets/Dashboard.svg";
import BookingIcon from "../assets/Booking.svg";
import ManagementIcon from "../assets/management.svg";
import UserDetailIcon from "../assets/userdetails.svg";
import back from "../assets/back.svg"; // Adjusted path

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role?: "admin" | "user";
}

const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="header">
          <button
            onClick={() => setIsOpen(false)}
            className="menu-btn"
            aria-label="Close menu"
          >
            <img src={back} alt="Close" />
          </button>
        </div>

        {/* Sidebar Content Based on Role */}
        <nav>
          <ul>
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="nav-link-content">
                  <img
                    src={DashboardIcon}
                    alt="Dashboard"
                    className="nav-icon"
                  />
                  Dashboard
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/booking"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="nav-link-content">
                  <img src={BookingIcon} alt="Booking" className="nav-icon" />
                  Booking
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/management"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="nav-link-content">
                  <img
                    src={ManagementIcon}
                    alt="Management"
                    className="nav-icon"
                  />
                  Management
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/userdetail"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="nav-link-content">
                  <img
                    src={UserDetailIcon}
                    alt="User Details"
                    className="nav-icon"
                  />
                  User Details
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}

      {/* Floating button to open Sidebar */}
      {!isOpen && (
        <div className="message-btn" onClick={() => setIsOpen(true)}>
          <img src={back} alt="Open Menu" />
        </div>
      )}

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 280px;
          background: #373636;
        
          
        
          box-sizing: border-box;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          z-index: 1000;
          overflow-y: auto;
          
          font-size: 24px;
          text-decoration: none;
          font-family: Titillium Web, sans-serif;

        }

        .sidebar.open {
          transform: translateX(0);
        }

        @media (min-width: 1280px) {
          .sidebar {
            transform: translateX(0) !important;
            position: static;
            border-radius: 0;
            border: none;
          }
        }

        .header {
          position: relative;
          display: flex;
          justify-content: flex-end; /* Align button to right */
          align-items: center;
          margin-bottom: 1rem;
          padding: 0;
        }

        .menu-btn {
          display: flex;
           position: fixed;
  top: 50%;
  left: 0px;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  padding: 12px;
  height: 40px;
  width: 40px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
        }
        .message-btn {
  position: fixed;
  top: 50%;
  left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;

  transform: rotate(180deg); /* ✅ Rotates the button */
}
        .nav-link-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px; /* base font size */
  color: #fff;
  transition: color 0.2s ease, font-size 0.2s ease;
}

.nav-icon {
  width: 1em;
  height: 1em;
  color: currentColor;
  fill: currentColor;
  transition: width 0.2s ease, height 0.2s ease, color 0.2s ease;
}


/* Active link styles */
nav ul li a.active .nav-link-content {
  color: #40BA36;
  font-weight: bold;
  font-size: 32px;  /* bigger font on active */
}

nav ul li a.active .nav-icon {
  width: 1em;  /* 1em here equals 32px now */
  height: 1em;
  /* color inherited from text */
}


        nav ul {
          list-style: none;
          }

        nav ul li {
        margin-top: 33px;
    padding: 0;
  }

  nav ul li a {
    text-decoration: none;
    color: #fff;
    display: block;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  nav ul li a:hover {
    background-color: #4a4a4a;
  }

 
   
       nav ul li a.active {
  background-color: transparent !important;
  color: #40BA36;
  font-weight: bold;
  font-size: 32px;
}


        .overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 900; /* less than sidebar */
        }

        @media (min-width: 1280px) {
          .overlay {
            display: none;
          }
        }


        .message-btn img {
          width: 16px;
          height: 16px;
        }

        /* Hide toggle buttons on desktop */
        @media (min-width: 1280px) {
          .menu-btn,
          .message-btn {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
