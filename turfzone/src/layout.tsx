import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Components/Hedder";
import Sidebar from "./Components/Sidebar";

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
         * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
         }

         html, body, #root {
           height: 100%;
         }

         .layout {
           display: flex;
           height: 100vh;
           overflow: hidden;
            background-color: white;
         }

        

         .page-content {
           flex: 1;
           height: 100vh;
           overflow-y: auto; /* allow scrolling content */
           background-color: #fff;
           padding: 30px;
           margin-left: 0;
           margin-top: 30px;
           border-top: 5px solid black;
           border-left: 5px solid black;
           transition: margin-left 0.3s ease;
         }

        
         header {
           position: fixed;
           top: 0;
           left: 0;
           right: 0;
           z-index: 1100;
           background: #fff;
           border-bottom: 1px solid #ccc;
           height: 60px;
         }

      `}</style>

      <Header />

      <div className="layout" style={{ paddingTop: "60px" }}>
        {/* Sidebar container for desktop width reserve */}
        <div className="sidebar-container">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} role="admin" />
        </div>

        {/* Main content area */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
