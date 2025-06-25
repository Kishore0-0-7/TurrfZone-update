import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Hedder from "./Components/Hedder";
import Hero from "./Components/Hero";
import Login from "./Login/Login";
import Secondpage from "./Components/Secondpage";
import Thirdpage from "./Components/Thirdpage";
import Layout from "./layout";
import Dashboard from "./Components/Dashboard";
import Booking from "./Components/Booking";
import Management from "./Components/Management";
import UserDetail from "./Components/UserDetail";
import { useRef, useEffect, useState } from "react";
import ProtectedRoute from "./Components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const secondPageRef = useRef<HTMLDivElement>(null);
  const thirdPageRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shouldScrollToThirdPage, setShouldScrollToThirdPage] = useState(false);
  const { currentUser, loading } = useAuth();

  const userTriggeredScroll = useRef(false); // ✅ Track if user action triggered scroll

  // ✅ Scroll to top on initial page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll to Second Page when button is clicked
  // const scrollToSecondPage = () => {
  //   secondPageRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // Trigger scroll to Third Page from Second Page (user action)
  const scrollToThirdPage = (date: Date) => {
    setSelectedDate(date);
    userTriggeredScroll.current = true; // ✅ Mark that scroll was user-initiated
    setShouldScrollToThirdPage(true);
  };

  // Scroll to Thirdpage only when user explicitly triggered it
  useEffect(() => {
    if (shouldScrollToThirdPage && userTriggeredScroll.current) {
      const timer = setTimeout(() => {
        thirdPageRef.current?.scrollIntoView({ behavior: "smooth" });
        setShouldScrollToThirdPage(false);
        userTriggeredScroll.current = false; // ✅ Reset after scroll
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedDate, shouldScrollToThirdPage]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5rem",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={
            <>
              <Hedder />
              <Hero
                onScrollClick={() => {
                  secondPageRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              />
              <div ref={secondPageRef}>
                <Secondpage onScrollToThirdPage={scrollToThirdPage} />
              </div>
              <div ref={thirdPageRef}>
                <Thirdpage
                  key={selectedDate.toDateString()}
                  selectedDate={selectedDate}
                />
              </div>
            </>
          }
        />

        {/* User Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />

        {/* ADMIN LAYOUT with Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="booking" element={<Booking />} />
          <Route
            path="management"
            element={<Management onScrollToThirdPage={() => {}} />}
          />
          <Route path="userdetail" element={<UserDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
