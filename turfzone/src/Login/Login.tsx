import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Logo from "../assets/logo.png";
import "./Login.css";

// Extend Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

// API base URL
const API_BASE_URL = "https://artechnology18.duckdns.org/api";

function Login() {
  const [formData, setFormData] = useState({
    phone: "",
    username: "",
    otp: "",
  });

  const [currentStep, setCurrentStep] = useState<
    "initial" | "phone-verify" | "username"
  >("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize reCAPTCHA with a slight delay to ensure the DOM element exists
    const initializeRecaptcha = () => {
      try {
        if (
          !window.recaptchaVerifier &&
          document.getElementById("recaptcha-container")
        ) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "normal",
              callback: (_response: any) => {
                console.log("reCAPTCHA solved successfully");
                setRecaptchaVerified(true);
                setError(""); // Clear any previous errors
              },
              "expired-callback": () => {
                console.log("reCAPTCHA expired");
                setRecaptchaVerified(false);
                setError("reCAPTCHA expired. Please verify again.");
              },
            }
          );

          // Render the reCAPTCHA
          window.recaptchaVerifier
            .render()
            .then(() => {
              console.log("reCAPTCHA rendered successfully");
            })
            .catch((error) => {
              console.error("Error rendering reCAPTCHA:", error);
              setError("Failed to load reCAPTCHA. Please refresh the page.");
            });
        }
      } catch (error) {
        console.error("Error initializing reCAPTCHA:", error);
        setError("Failed to initialize reCAPTCHA. Please refresh the page.");
      }
    };

    // Use a timeout to ensure the DOM is ready
    const timeout = setTimeout(initializeRecaptcha, 1000);

    return () => {
      clearTimeout(timeout);
      // Clean up reCAPTCHA when component unmounts
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          delete (window as any).recaptchaVerifier;
        } catch (error) {
          console.error("Error cleaning up reCAPTCHA:", error);
        }
      }
    };
  }, []);

  // OTP Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setTimerActive(false);
            setError("OTP has expired. Please request a new one.");
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, otpTimer]);

  // Format timer display (MM:SS)
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Check if user exists in database
  const checkUserInDatabase = async (phoneNumber: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user/check?phoneNumber=${phoneNumber}`
      );
      if (response.ok) {
        const data = await response.json();
        return { exists: true, name: data.name, userId: data.userId };
      } else {
        return { exists: false };
      }
    } catch (error) {
      console.error("Error checking user:", error);
      return { exists: false };
    }
  };

  // Register new user
  const registerUser = async (phoneNumber: string, name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          name: name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, userId: data.userId };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return { success: false, error: "Network error" };
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { phone } = formData;

      // Validate phone input
      if (!/^\d{10}$/.test(phone)) {
        setError("Please enter a valid 10-digit phone number.");
        setLoading(false);
        return;
      }

      // Check if reCAPTCHA is verified
      if (!recaptchaVerified) {
        setError("Please complete the reCAPTCHA verification.");
        setLoading(false);
        return;
      }

      // Send OTP using Firebase
      const phoneNumber = `+91${phone}`;
      console.log("Sending OTP to phone:", phoneNumber);

      try {
        await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier
        );
        // setConfirmationResult(confirmation);
        console.log("OTP sent successfully via Firebase");
      } catch (firebaseError) {
        console.log(
          "Firebase OTP failed, proceeding with dummy OTP:",
          firebaseError
        );
      }

      // Move to OTP verification step (whether Firebase worked or not)
      setCurrentStep("phone-verify");

      // Start the 5-minute countdown timer
      setOtpTimer(300); // Reset to 5 minutes
      setTimerActive(true);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { username, phone } = formData; // Removed email since it's commented out

      if (!username.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }

      // Register the user
      const result = await registerUser(phone, username.trim());

      if (result.success) {
        // Store user info and redirect to home page
        const userData: any = {
          username: username.trim(),
          phone: phone,
          isAuthenticated: true,
        };

        // Email assignment commented out since email field is commented out
        // if (verificationType === 'email') {
        //   userData.email = email;
        // }

        localStorage.setItem("user", JSON.stringify(userData));

        // Trigger auth context update
        window.dispatchEvent(new CustomEvent("userLogin"));

        // Small delay to ensure auth context updates
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        setError(result.error || "Failed to register user. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to register user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dummy OTP verification - accepts any 6-digit code for now
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { otp, phone } = formData;

      if (!otp || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        setLoading(false);
        return;
      }

      if (otpTimer === 0) {
        setError("OTP has expired. Please request a new one.");
        setLoading(false);
        return;
      }

      // Dummy OTP verification - accept any 6-digit code for now
      console.log("Verifying dummy OTP:", otp, "for phone:", phone);

      // Stop the timer when OTP is successfully verified
      setTimerActive(false);

      // Check if user exists in database
      const userExists = await checkUserInDatabase(phone);

      if (userExists.exists) {
        // Store user info and redirect to home page
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: userExists.name,
            phone: phone,
            isAuthenticated: true,
          })
        );

        // Trigger auth context update
        window.dispatchEvent(new CustomEvent("userLogin"));

        navigate("/");
      } else {
        // User needs to provide username
        setCurrentStep("username");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const phoneNumber = `+91${formData.phone}`;
      console.log("Resending OTP to phone:", phoneNumber);

      try {
        await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier
        );
        // setConfirmationResult(confirmation);
        console.log("OTP resent successfully via Firebase");
      } catch (firebaseError) {
        console.log(
          "Firebase OTP failed, proceeding with dummy OTP:",
          firebaseError
        );
      }

      // Reset and start the timer again
      setOtpTimer(300);
      setTimerActive(true);
      setError("");

      // Clear the OTP input
      setFormData((prev) => ({ ...prev, otp: "" }));
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
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
          {currentStep === "initial" && (
            <form className="login-form" onSubmit={handleVerificationSubmit}>
              <h2>Login</h2>

              <div className="lables">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  required
                />
              </div>

              {/* reCAPTCHA container - visible in form */}
              <div className="recaptcha-wrapper">
                <div id="recaptcha-container"></div>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button
                type="submit"
                disabled={loading || !recaptchaVerified}
                className="submit-btn"
                style={{
                  opacity: recaptchaVerified ? 1 : 0.6,
                  cursor: recaptchaVerified ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {currentStep === "phone-verify" && (
            <form className="login-form" onSubmit={handleVerifyOTP}>
              <h2>Verify Phone Number</h2>
              <div className="message-container">
                <p className="success-message">
                  A verification code has been sent to{" "}
                  <strong>+91{formData.phone}</strong>.
                </p>
                <p>Please enter the 6-digit code below.</p>

                {/* OTP Timer Display */}
                <div className="otp-timer-container">
                  {timerActive ? (
                    <p className="timer-message">
                      OTP expires in:
                      <span
                        className="timer-display"
                        data-warning={
                          otpTimer <= 120 && otpTimer > 60 ? "true" : "false"
                        }
                        data-critical={otpTimer <= 60 ? "true" : "false"}
                      >
                        {formatTimer(otpTimer)}
                      </span>
                    </p>
                  ) : otpTimer === 0 ? (
                    <p className="timer-expired">
                      OTP has expired. Please go back and request a new one.
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="lables">
                <label htmlFor="otp">Verification Code:</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  disabled={otpTimer === 0}
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" disabled={loading || otpTimer === 0}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              {/* Resend OTP Button - only show when timer has expired */}
              {otpTimer === 0 && (
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>
              )}

              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setCurrentStep("initial");
                  setError("");
                  setTimerActive(false);
                  setOtpTimer(300);
                }}
                disabled={loading}
              >
                Back
              </button>
            </form>
          )}

          {currentStep === "username" && (
            <form className="login-form" onSubmit={handleRegisterUser}>
              <h2>Complete Registration</h2>
              <div className="phone-display">
                <p>
                  <strong>Phone:</strong> {formData.phone}
                </p>
              </div>
              <div className="username-block">
                <div className="avatar">
                  {formData.username
                    ? formData.username.charAt(0).toUpperCase()
                    : "👤"}
                </div>
              </div>
              <div className="lables">
                <label htmlFor="username">User Name:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
