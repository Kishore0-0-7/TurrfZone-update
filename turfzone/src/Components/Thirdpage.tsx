import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Thirdpage.css";
import {
  getSlotsByDate,
  bookSlot,
  formatTimeForAPI,
  formatDateForAPI,
  checkUser,
  registerUser,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

type SlotStatus = "available" | "booked" | "disabled" | "maintenance";

type Slot = {
  time: string;
  status: SlotStatus;
};

type Props = {
  selectedDate: Date;
};

const defaultSlots: Slot[] = [
  { time: "12 AM", status: "available" },
  { time: "1 AM", status: "available" },
  { time: "2 AM", status: "available" },
  { time: "3 AM", status: "available" },
  { time: "4 AM", status: "available" },
  { time: "5 AM", status: "available" },
  { time: "6 AM", status: "available" },
  { time: "7 AM", status: "available" },
  { time: "8 AM", status: "available" },
  { time: "9 AM", status: "available" },
  { time: "10 AM", status: "available" },
  { time: "11 AM", status: "available" },
  { time: "12 PM", status: "available" },
  { time: "1 PM", status: "available" },
  { time: "2 PM", status: "available" },
  { time: "3 PM", status: "available" },
  { time: "4 PM", status: "available" },
  { time: "5 PM", status: "available" },
  { time: "6 PM", status: "available" },
  { time: "7 PM", status: "available" },
  { time: "8 PM", status: "available" },
  { time: "9 PM", status: "available" },
  { time: "10 PM", status: "available" },
  { time: "11 PM", status: "available" },
  { time: "12 AM (Next Day)", status: "available" },
];

const Thirdpage: React.FC<Props> = ({ selectedDate }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>(
    defaultSlots.map((slot) => ({ ...slot }))
  );
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [startSlotIndex, setStartSlotIndex] = useState<number | null>(null);
  const [endSlotIndex, setEndSlotIndex] = useState<number | null>(null);
  const [showEndTimePopup, setShowEndTimePopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showLoginRequiredPopup, setShowLoginRequiredPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromTime =
    startSlotIndex !== null
      ? slots[startSlotIndex].time.replace(" (Next Day)", "")
      : "";
  const toTime =
    endSlotIndex !== null
      ? slots[endSlotIndex].time.replace(" (Next Day)", "")
      : "";
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const parseTime = (timeStr: string, date: Date) => {
    const isNextDay = timeStr.includes("Next Day");
    const [hourStr, meridian] = timeStr
      .replace(" (Next Day)", "")
      .trim()
      .split(" ");
    let hour = parseInt(hourStr, 10);
    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;
    const result = new Date(date);
    if (isNextDay) result.setDate(result.getDate() + 1);
    result.setHours(hour, 0, 0, 0);
    return result;
  };

  // Load slots from backend when date changes
  useEffect(() => {
    let isCancelled = false; // Prevent state updates if component unmounts

    const loadSlots = async () => {
      if (isCancelled) return;

      setLoading(true);
      setError(null);

      // Reset selected slots but keep existing slots visible during loading
      setSelectedSlots([]);

      try {
        // Get current time info
        const now = new Date();
        const selectedDateString = selectedDate.toDateString();
        const todayString = now.toDateString();
        const isToday = selectedDateString === todayString;

        // Get booked/unavailable slots from backend for this specific date
        const slotsFromBackend = await getSlotsByDate(selectedDate);

        if (isCancelled) return; // Don't continue if component unmounted

        console.log(
          `📅 Processing ${slotsFromBackend.length} slots from backend for ${selectedDateString}`
        );

        // Create a Set of unavailable slot times for faster lookup
        // Backend returns slots with status 'Unavailable' for booked/blocked slots
        const unavailableSlotTimes = new Set(
          slotsFromBackend
            .filter((slot) => slot.status === "Unavailable")
            .map((slot) => slot.slotTime)
        );

        console.log("🚫 Unavailable slots:", Array.from(unavailableSlotTimes));

        // Process each default slot
        const processedSlots = defaultSlots.map((slot) => {
          const slotTime = slot.time;
          const cleanSlotTime = slotTime.replace(" (Next Day)", "");

          // FIRST PRIORITY: If it's today, check if the slot time has passed
          // Past time slots should always be disabled regardless of booking status
          if (isToday) {
            const slotDateTime = parseTime(slotTime, selectedDate);
            const hasSlotPassed = now >= slotDateTime;

            if (hasSlotPassed) {
              return {
                ...slot,
                status: "disabled" as SlotStatus,
              };
            }
          }

          // SECOND PRIORITY: Check if this slot is unavailable/booked from backend
          // Only apply this if the slot time hasn't passed
          if (unavailableSlotTimes.has(cleanSlotTime)) {
            return {
              ...slot,
              status: "booked" as SlotStatus,
            };
          }

          // DEFAULT: Available
          return {
            ...slot,
            status: "available" as SlotStatus,
          };
        });

        const statusCounts = {
          booked: processedSlots.filter((s) => s.status === "booked").length,
          disabled: processedSlots.filter((s) => s.status === "disabled")
            .length,
          available: processedSlots.filter((s) => s.status === "available")
            .length,
        };
        console.log("✅ Final slot status counts:", statusCounts);

        if (!isCancelled) {
          // Update slots after processing is complete
          setSlots(processedSlots);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading slots:", err);
          setError("Failed to load slot data");

          // Fallback to default slots with proper time-based disabling
          const now = new Date();
          const isToday = selectedDate.toDateString() === now.toDateString();

          const fallbackSlots = defaultSlots.map((slot) => {
            if (isToday) {
              const slotDateTime = parseTime(slot.time, selectedDate);
              const hasSlotPassed = now >= slotDateTime;
              if (hasSlotPassed) {
                return { ...slot, status: "disabled" as SlotStatus };
              }
            }
            return { ...slot };
          });

          setSlots(fallbackSlots);
          setLoading(false);
        }
      }
    };

    loadSlots();

    // Cleanup function to prevent memory leaks
    return () => {
      isCancelled = true;
    };

    // Scroll to top
    setTimeout(() => {
      if (slotRefs.current[0]) {
        slotRefs.current[0].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }, [selectedDate]);

  // Separate effect for updating time-based slot status every minute
  useEffect(() => {
    if (selectedDate.toDateString() !== new Date().toDateString()) {
      // Only run time updates for today
      return;
    }

    const updateTimeBasedStatus = () => {
      const now = new Date();

      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          // Check if this slot time has passed
          const slotDateTime = parseTime(slot.time, selectedDate);
          const shouldDisable = now >= slotDateTime;

          // PRIORITY: Time-based disabling overrides all other statuses
          if (shouldDisable) {
            return { ...slot, status: "disabled" as SlotStatus };
          }

          // If time hasn't passed, maintain current status
          // (but don't change disabled slots back to available/booked without proper logic)
          return slot;
        })
      );
    };

    // Update immediately
    updateTimeBasedStatus();

    // Set up interval for future updates
    const interval = setInterval(updateTimeBasedStatus, 60000); // Every minute

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleSlotClick = (index: number) => {
    const clickedSlot = slots[index];
    if (clickedSlot.status !== "available") return;

    // Check if user is authenticated before allowing slot selection
    if (!currentUser) {
      setShowLoginRequiredPopup(true);
      return;
    }

    setStartSlotIndex(index);
    setShowEndTimePopup(true);
    setError(null); // Clear any previous errors
  };

  const handleConfirm = () => {
    setShowPopup(false);
    setShowSuccessPopup(true);
    setError(null); // Clear any previous errors
  };

  const handleFinalConfirm = async () => {
    // Double-check authentication before proceeding with booking
    if (!currentUser) {
      setShowLoginRequiredPopup(true);
      setShowSuccessPopup(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get or create user ID in the backend using the phone number from authentication
      if (!currentUser.phoneNumber) {
        throw new Error(
          "No phone number associated with your account. Please update your profile."
        );
      }

      // First check if user exists in backend
      const userCheckResponse = await checkUser(currentUser.phoneNumber);

      let userId: number;

      if (userCheckResponse.userId) {
        // User exists, use their ID
        userId = userCheckResponse.userId;
        console.log(`✅ Found existing user with ID: ${userId}`);
      } else {
        // User doesn't exist, register them
        const userRegisterResponse = await registerUser({
          phoneNumber: currentUser.phoneNumber,
          name: currentUser.displayName || undefined,
        });

        if (!userRegisterResponse.userId) {
          throw new Error("Failed to register user in backend");
        }

        userId = userRegisterResponse.userId;
        console.log(`✅ Registered new user with ID: ${userId}`);
      }

      // IMPORTANT: Backend expects a 32-bit integer (max ~2.14 billion)
      // Ensure userId is within int32 range
      userId = Math.min(Number(userId), 2147483647);

      // Construct bookingData with PascalCase keys for backend compatibility
      // Special handling for midnight (12 AM) end time
      // If toTime is 12 AM, we need to handle it specially
      let endTime = formatTimeForAPI(toTime);

      // Log the bookingData for debugging
      console.log("🕒 Time values:", {
        fromRaw: fromTime,
        toRaw: toTime,
        fromFormatted: formatTimeForAPI(fromTime),
        toFormatted: endTime,
      });

      const bookingData = {
        UserId: userId,
        BookingDate: formatDateForAPI(selectedDate), // "YYYY-MM-DD"
        SlotTimeFrom: formatTimeForAPI(fromTime), // e.g. "2 PM"
        SlotTimeTo: endTime, // e.g. "5 PM" or "12 AM"
        Amount: sorted.length * 600,
      };

      console.log("🎯 Booking data being sent:", {
        ...bookingData,
        selectedDate: selectedDate.toString(),
        fromTime,
        toTime,
        sorted,
      });

      // Submit booking to backend
      const result = await bookSlot(bookingData);

      if (result.bookingId) {
        // Update local state to reflect booking
        const updatedSlots = slots.map((slot, i) =>
          selectedSlots.includes(i)
            ? { ...slot, status: "booked" as SlotStatus }
            : slot
        );
        setSlots(updatedSlots);
        setSelectedSlots([]);
        setStartSlotIndex(null); // Reset start slot
        setEndSlotIndex(null); // Reset end slot
        setShowSuccessPopup(false);
      }
    } catch (err: any) {
      console.error("Error booking slot:", err);
      setError(err.message || "Failed to book slot. Please try again.");
      // Don't close popup on error
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...selectedSlots].sort((a, b) => a - b);
  const bookingInfo = {
    date: selectedDate.toLocaleDateString("en-GB"),
    name: currentUser?.displayName || "Guest",
    phone: currentUser?.phoneNumber || "",
    time: `${fromTime} - ${toTime}`,
    price: sorted.length * 600,
  };

  // Calculate total hours based on selected slots (each slot is 1 hour here, adjust if needed)
  const totalHours = sorted.length;

  return (
    <div className="main">
      <div className="wrapper">
        {error && <div className="error">{error}</div>}
        <div className="inner-inner">
          {loading ? (
            <div className="loading">
              Loading slots for {selectedDate.toDateString()}...
            </div>
          ) : (
            slots
              .filter((slot) => slot.time !== "12 AM (Next Day)")
              .map((slot, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    slotRefs.current[index] = el;
                  }}
                  className={`slot ${slot.status} ${
                    selectedSlots.includes(index) ? "selected" : ""
                  }`}
                  onClick={() => handleSlotClick(index)}
                >
                  {slot.status === "maintenance"
                    ? "Under Maintenance"
                    : slot.time}
                </div>
              ))
          )}
        </div>

        {showPopup && !showOtpPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Confirmation</h2>
              <div className="popup-row">
                <div className="popup-col">
                  <span>From :</span>
                  <div className="time-display">{fromTime}</div>
                </div>
                <div className="popup-col">
                  <span>To :</span>
                  <div className="time-display">{toTime}</div>
                </div>
              </div>

              <div className="popup-row2">
                <span> Total Hours:</span>
                <div className="amount-box">{totalHours} hrs</div>
              </div>
              <div className="popup-row2">
                <span>Amount In Total:</span>
                <div className="amount-box">₹{bookingInfo.price}/-</div>
              </div>
              <p className="note">🔴 Note: This Booking Can’t be Canceled</p>
              <div className="popup-buttons">
                <button
                  className="popup-cancel"
                  onClick={() => {
                    setShowPopup(false);
                    setSelectedSlots([]); // Clear selected slots
                    setStartSlotIndex(null); // Reset start slot
                    setEndSlotIndex(null); // Reset end slot
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="popup-confirm"
                  onClick={() => setShowOtpPopup(true)}
                >
                  Get OTP
                </button>
              </div>
            </div>
          </div>
        )}
        {showPopup && showOtpPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h2>Confirmation</h2>
              <div className="popup-row">
                <span>From :</span>
                <div className="time-display">{fromTime}</div>
                <span>To :</span>
                <div className="time-display">{toTime}</div>
              </div>
              <div className="popup-row2">
                <span> Total Hours:</span>
                <div className="amount-box">{totalHours} hrs</div>
              </div>
              <div className="popup-row2">
                <span>Amount In Total:</span>
                <div className="amount-box">₹{bookingInfo.price}/-</div>
              </div>
              <div className="popup-row3">
                <span>Enter OTP :</span>
                <input
                  type="text"
                  className="otp-input"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
              <p className="note">🔴 Note: This Booking Can’t be Canceled</p>
              <div className="popup-buttons">
                <button
                  className="popup-cancel"
                  onClick={() => {
                    setShowOtpPopup(false);
                    setShowPopup(false);
                    setSelectedSlots([]); // Clear selected slots
                    setStartSlotIndex(null); // Reset start slot
                    setEndSlotIndex(null); // Reset end slot
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button className="popup-confirm" onClick={handleConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessPopup && (
          <div className="popup-overlay">
            <div className="success-popup">
              <div className="tick">✓</div>
              <h2>Thanks for your booking</h2>
              <h3>Your Slot is Ready!</h3>
              {error && <div className="error">{error}</div>}
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Phone No.</th>
                    <th>Time</th>
                    <th>Price in ₹</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{bookingInfo.date}</td>
                    <td>{bookingInfo.name}</td>
                    <td>{bookingInfo.phone}</td>
                    <td>{bookingInfo.time}</td>
                    <td>{bookingInfo.price}</td>
                  </tr>
                </tbody>
              </table>
              <button
                className="final-confirm"
                onClick={handleFinalConfirm}
                disabled={loading}
              >
                {loading ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        )}

        {showLoginRequiredPopup && (
          <div className="popup-overlay">
            <div className="popup login-required-popup">
              <h2>Login Required</h2>
              <p>You need to login to book slots. Please login to continue.</p>
              <div className="popup-buttons">
                <button
                  className="popup-confirm login-btn"
                  onClick={() => {
                    setShowLoginRequiredPopup(false);
                    // Navigate to login page
                    navigate("/login");
                  }}
                >
                  Login
                </button>
                <button
                  className="popup-cancel"
                  onClick={() => {
                    setShowLoginRequiredPopup(false);
                    setSelectedSlots([]); // Clear selected slots
                    setStartSlotIndex(null); // Reset start slot
                    setEndSlotIndex(null); // Reset end slot
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showEndTimePopup && startSlotIndex !== null && (
          <div
            className="slide-overlay"
            onClick={() => {
              setShowEndTimePopup(false);
              setSelectedSlots([]); // Clear selected slots
              setStartSlotIndex(null); // Reset start slot
              setEndSlotIndex(null); // Reset end slot
            }}
          >
            <div className="slide-popup" onClick={(e) => e.stopPropagation()}>
              <div>
                <h2>Select End Time</h2>
                <div className="end-time-options">
                  {(() => {
                    const start = startSlotIndex + 1;
                    const endOptions = [];
                    let availableCount = 0;
                    let nonAvailableShown = false;

                    for (let i = start; i < slots.length; i++) {
                      const slot = slots[i];
                      if (slot.status === "available") {
                        if (availableCount < 4) {
                          endOptions.push(
                            <div
                              key={i}
                              className="end-time-option"
                              onClick={() => {
                                // Check authentication before proceeding with selection
                                if (!currentUser) {
                                  setShowLoginRequiredPopup(true);
                                  setShowEndTimePopup(false);
                                  return;
                                }

                                const selected = [];

                                // Select all slots from start to end (non-inclusive of end time)
                                for (let j = startSlotIndex; j < i; j++) {
                                  selected.push(j);
                                }

                                // Debug log the selection
                                console.log(
                                  `⏰ Selected slots from ${startSlotIndex} (${slots[startSlotIndex].time}) to ${i} (${slots[i].time})`
                                );
                                console.log(
                                  `🔄 Selected time range: ${slots[startSlotIndex].time} to ${slots[i].time}`
                                );

                                setSelectedSlots(selected);
                                setEndSlotIndex(i);
                                setShowEndTimePopup(false);
                                setShowPopup(true); // immediately trigger popup
                              }}
                            >
                              {slot.time.replace(" (Next Day)", "")}
                            </div>
                          );
                          availableCount++;
                        } else {
                          break;
                        }
                      } else if (!nonAvailableShown) {
                        endOptions.push(
                          <div
                            key={i}
                            className="end-time-option non-available"
                            onClick={() => {
                              // Check authentication before proceeding with selection
                              if (!currentUser) {
                                setShowLoginRequiredPopup(true);
                                setShowEndTimePopup(false);
                                return;
                              }

                              const selected = [];

                              // Select all slots from start to end (non-inclusive of end time)
                              for (let j = startSlotIndex; j < i; j++) {
                                selected.push(j);
                              }

                              // Debug log the selection
                              console.log(
                                `⏰ Selected slots from ${startSlotIndex} (${slots[startSlotIndex].time}) to ${i} (${slots[i].time})`
                              );
                              console.log(
                                `🔄 Selected time range: ${slots[startSlotIndex].time} to ${slots[i].time}`
                              );

                              setSelectedSlots(selected);
                              setEndSlotIndex(i);
                              setShowEndTimePopup(false);
                              setShowPopup(true); // immediately trigger popup
                            }}
                          >
                            {slot.status === "maintenance"
                              ? "Under Maintenance"
                              : slot.time.replace(" (Next Day)", "")}
                          </div>
                        );
                        nonAvailableShown = true;
                        break;
                      }
                    }

                    return endOptions;
                  })()}
                </div>

                <button
                  className="popup-cancel"
                  onClick={() => {
                    setShowEndTimePopup(false);
                    setSelectedSlots([]); // Clear selected slots
                    setStartSlotIndex(null); // Reset start slot
                    setEndSlotIndex(null); // Reset end slot
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Thirdpage;
