const API_BASE_URL = "https://artechnology18.duckdns.org/api"; // Remote backend server

// OTP-related interfaces
export interface OtpSendRequest {
  phoneNumber: string;
}

export interface OtpSendResponse {
  message: string;
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  otp: string;
}

export interface OtpVerifyResponse {
  message: string;
}

export interface SlotDto {
  slotId: number;
  slotDate: string;
  slotTime: string;
  status: string;
}

export interface BookingRequest {
  UserId: number;
  BookingDate: string;
  SlotTimeFrom: string;
  SlotTimeTo: string;
  Amount: number;
}

export interface BookingResponse {
  message: string;
  bookingId?: number;
  error?: string;
}

// User-related interfaces
export interface UserDto {
  phoneNumber: string;
  name?: string;
}

export interface UserCheckResponse {
  message: string;
  userId?: number;
  name?: string;
}

export interface UserRegisterResponse {
  message: string;
  userId?: number;
  name?: string;
  phoneNumber?: string;
}

export interface UserUpdateResponse {
  message: string;
  userId?: number;
  name?: string;
  phoneNumber?: string;
}

// Get slots with exceptions (booked/maintenance slots) for a specific date or all upcoming
export const getSlotExceptions = async (): Promise<SlotDto[]> => {
  try {
    console.log("📋 Fetching all slot exceptions...");
    const response = await fetch(`${API_BASE_URL}/slots/exceptions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(`📊 Found ${result.length} total exception slots`);
    return result;
  } catch (error) {
    console.error("Error fetching slot exceptions:", error);
    throw error;
  }
};

// Add maintenance slot
export const addMaintenanceSlot = async (
  slotDate: string,
  slotTime: string
): Promise<any> => {
  try {
    console.log(`🔧 Adding maintenance slot for ${slotDate} at ${slotTime}`);
    const response = await fetch(`${API_BASE_URL}/slots/maintenance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slotDate,
        slotTime,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error adding maintenance slot:", error);
    throw error;
  }
};

// Remove slot
export const removeSlot = async (slotId: number): Promise<any> => {
  try {
    console.log(`🗑️ Removing slot with ID: ${slotId}`);
    const response = await fetch(`${API_BASE_URL}/slots/${slotId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error removing slot:", error);
    throw error;
  }
};

// Book a slot
export const bookSlot = async (
  bookingData: BookingRequest
): Promise<BookingResponse> => {
  try {
    // Ensure values are in the correct format for the backend
    // UserId MUST be a 32-bit integer (max value: 2,147,483,647)
    // If larger values like phone numbers are used, they must be truncated
    const payload = {
      UserId: Math.min(Number(bookingData.UserId), 2147483647), // Ensure it's within int32 range
      BookingDate: bookingData.BookingDate, // Format: "YYYY-MM-DD"
      SlotTimeFrom: bookingData.SlotTimeFrom,
      SlotTimeTo: bookingData.SlotTimeTo,
      Amount: Number(bookingData.Amount), // Ensure it's a number
    };

    console.log("📤 Sending booking request:", payload);

    const response = await fetch(`${API_BASE_URL}/booking/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("📥 Backend response:", result);
    console.log("📊 Response status:", response.status);

    if (!response.ok) {
      // Extract detailed error information for debugging
      const errorDetails = result.errors ? JSON.stringify(result.errors) : "";
      const errorMessage =
        result.message ||
        result.error ||
        `HTTP error! status: ${response.status}${
          errorDetails ? " - " + errorDetails : ""
        }`;
      console.error("Error details:", result);
      throw new Error(errorMessage);
    }
    return result;
  } catch (error) {
    console.error("Error booking slot:", error);
    throw error;
  }
};

// Get slots for a specific date
export const getSlotsByDate = async (date: Date): Promise<SlotDto[]> => {
  try {
    const formattedDate = formatDateForAPI(date);
    const url = `${API_BASE_URL}/slots/date/${formattedDate}`;

    console.log(`📅 Fetching slots for date: ${formattedDate}`);
    console.log(`🔗 Request URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      `📊 Found ${result.length} unavailable slots for ${formattedDate}:`,
      result
    );
    return result;
  } catch (error) {
    console.error("Error fetching slots by date:", error);
    throw error;
  }
};

// Helper function to format date for API calls
export const formatDateForAPI = (date: Date): string => {
  // Use local date components to avoid timezone issues
  // Format must be "YYYY-MM-DD" for the backend to parse correctly
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to format time for API calls
export const formatTimeForAPI = (timeStr: string): string => {
  // Clean the time string and handle special cases
  // Frontend sends "12 AM", "2 PM", backend expects "12 AM", "2 PM"
  const cleanTime = timeStr.replace(" (Next Day)", "");

  // Ensure proper handling of 12 AM/12 PM cases
  if (cleanTime === "12 AM" || cleanTime === "12 PM") {
    return cleanTime;
  }

  return cleanTime;
};

// Check if user exists by phone number
export const checkUser = async (
  phoneNumber: string
): Promise<UserCheckResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/user/check?phoneNumber=${phoneNumber}`
    );

    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return { message: "User not found" };
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error checking user:", error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (
  userData: UserDto
): Promise<UserRegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Update user name
export const updateUserName = async (
  phoneNumber: string,
  name: string
): Promise<UserUpdateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/update-name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        name,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error;
  }
};

// OTP Functions using SampleOtpController
// Send OTP to phone number
export const sendOtp = async (
  phoneNumber: string
): Promise<OtpSendResponse> => {
  try {
    console.log(`📱 Sending OTP to phone: ${phoneNumber}`);
    const response = await fetch(`${API_BASE_URL}/SampleOtp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    console.log(
      `✅ OTP sent successfully to ${phoneNumber}. Check console for OTP.`
    );
    return result;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// Verify OTP
export const verifyOtp = async (
  phoneNumber: string,
  otp: string
): Promise<OtpVerifyResponse> => {
  try {
    console.log(`🔐 Verifying OTP for phone: ${phoneNumber}, OTP: ${otp}`);
    const response = await fetch(`${API_BASE_URL}/SampleOtp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        otp: otp,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    console.log(`✅ OTP verified successfully for ${phoneNumber}`);
    return result;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};
