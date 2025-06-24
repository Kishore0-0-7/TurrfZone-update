import { useState } from "react";
import Logo from "../assets/logo.png";
import "./Login.css";
import { auth } from "../firebase/config";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Check if current URL contains sign-in link
  const checkEmailLink = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get email from localStorage that we saved before sending the link
      let email = localStorage.getItem("emailForSignIn");
      
      if (!email) {
        // If email not found in localStorage, ask the user for it
        email = window.prompt("Please provide your email for confirmation");
      }
      
      if (email) {
        setLoading(true);
        try {
          // Complete the sign-in process
          await signInWithEmailLink(auth, email, window.location.href);
          
          // Clear the URL to remove the sign-in link parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Store user info in localStorage
          localStorage.setItem('user', JSON.stringify({
            username: localStorage.getItem("usernameForSignIn") || "User",
            email: email,
            isAuthenticated: true
          }));
          
          // Remove email from localStorage
          localStorage.removeItem("emailForSignIn");
          localStorage.removeItem("usernameForSignIn");
          
          // Navigate to Dashboard
          navigate('/dashboard');
        } catch (err: any) {
          setError(err.message || "Error signing in with email link");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Check for email link on component mount
  useState(() => {
    checkEmailLink();
  });

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const { email, username } = formData;
      
      // URL configuration for email link
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
      };
      
      // Send sign-in link to user's email
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save the email and username in localStorage
      localStorage.setItem("emailForSignIn", email);
      localStorage.setItem("usernameForSignIn", username);
      
      setEmailSent(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to send email. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="overall">
      <div className="left-log">
        <img src={Logo} alt="Logo" className="logo-image" />
      </div>

      <div className="right-log">
        <div className="form">
          {!emailSent ? (
            <form className="login-form" onSubmit={handleSendEmailLink}>
              <h2>Login</h2>
              <div className="lables">
                <label htmlFor="username">User Name:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="email">Email Address:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>
              
              {error && <p className="error-message">{error}</p>}
              
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Login Link"}
              </button>
            </form>
          ) : (
            <div className="login-form">
              <h2>Email Sent</h2>
              <div className="message-container">
                <p className="success-message">
                  A login link has been sent to <strong>{formData.email}</strong>.
                </p>
                <p>
                  Please check your email and click on the link to complete the login process.
                </p>
                <p className="note-message">
                  Note: If you don't see the email, check your spam folder.
                </p>
              </div>
              
              {error && <p className="error-message">{error}</p>}
              
              <button 
                type="button" 
                className="back-button" 
                onClick={() => setEmailSent(false)}
                disabled={loading}
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;