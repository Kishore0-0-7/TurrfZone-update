const API_BASE_URL = 'http://localhost:5125/api'; // Backend is running on HTTP

export interface SlotDto {
  slotId: number;
  slotDate: string;
  slotTime: string;
  status: string;
}

export interface BookingRequest {
  userId: number;
  bookingDate: string;
  slotTimeFrom: string;
  slotTimeTo: string;
  amount: number;
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

// Get slots with exceptions (booked/maintenance slots) for a specific date or all upcoming
export const getSlotExceptions = async (): Promise<SlotDto[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/slots/exceptions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching slot exceptions:', error);
    throw error;
  }
};

// Book a slot
export const bookSlot = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};

// Get slots for a specific date
export const getSlotsByDate = async (date: Date): Promise<SlotDto[]> => {
  try {
    const formattedDate = formatDateForAPI(date);
    const url = `${API_BASE_URL}/slots/date/${formattedDate}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching slots by date:', error);
    throw error;
  }
};

// Helper function to format date for API calls
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper function to format time for API calls
export const formatTimeForAPI = (timeStr: string): string => {
  // Convert "12 AM" format to "12 AM" format (keep as is for backend compatibility)
  const cleanTime = timeStr.replace(" (Next Day)", "");
  return cleanTime;
};

// Check if user exists by phone number
export const checkUser = async (phoneNumber: string): Promise<UserCheckResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/check?phoneNumber=${phoneNumber}`);
    
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return { message: "User not found" };
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (userData: UserDto): Promise<UserRegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};