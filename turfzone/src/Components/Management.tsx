import { useEffect, useState } from "react";
import { useRef as reactUseRef } from "react";
import { useNavigate } from "react-router-dom";
import back from "../assets/back.svg";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const Secondpage = ({
  onScrollToThirdPage,
}: {
  onScrollToThirdPage: (date: Date) => void;
}) => {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(today);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  const nextWeek = () =>
    setSelectedDate(
      (prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000)
    );

  const prevWeek = () => {
    const newDate = new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (newDate >= today) {
      setSelectedDate(newDate);
    }
  };
    const nextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= today) {
      setSelectedDate(newDate);
    }
  };


  const getWeekDates = () => {
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  useEffect(() => {
    setClickedDate(today);
  }, []);

  const formatDate = (date: Date) => `${date.getDate()}`;
  const isPastDate = (date: Date) => date < today;

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;
    setClickedDate(date);
    onScrollToThirdPage(date);
  };

  const weekDates = getWeekDates();
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const slotRefs = reactUseRef<(HTMLDivElement | null)[]>([]);

const [popupSlotIndex, setPopupSlotIndex] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);

// Handle slot click for selection and maintenance popup
const handleSlotClick = (index: number) => {
  const slot = slots[index];
  if (slot.status === "maintenance") {
    setPopupSlotIndex(index);
    return;
  }
  if (slot.status === "disabled" || slot.status === "booked") {
    return;
  }
  setSelectedSlots((prevSelected) =>
    prevSelected.includes(index)
      ? prevSelected.filter((i) => i !== index)
      : [...prevSelected, index]
  );
};

 const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const checked = e.target.checked;
  setSelectAll(checked);

  if (checked) {
    // Select only available slots
    const allAvailable = slots
      .map((slot, index) => (slot.status === "available" ? index : -1))
      .filter((i) => i !== -1);
    setSelectedSlots(allAvailable);
  } else {
    setSelectedSlots([]);
  }
};
const [slots, setSlots] = useState<Slot[]>(defaultSlots);

const handleMarkAsMaintenance = () => {
  const updatedSlots = slots.map((slot, index) =>
    selectedSlots.includes(index)
      ? { ...slot, status: "maintenance" as SlotStatus }
      : slot
  );
  setSlots(updatedSlots);
  setSelectedSlots([]);
  setSelectAll(false);
};



  return (
  
    <div className="main-container">
      <button className="back-button" onClick={() => navigate(-1)}>
          <img src={back} alt="Back" />
          Management
        </button>

      {/* Month Navigation */}
      <div className="calendar-nav">
        <button className="left-calendar" onClick={prevMonth}>
          &#x276E;
        </button>
        <span>
          {selectedDate.toLocaleString("default", { month: "long" })}{" "}
          {selectedDate.getFullYear()}
        </span>
        <button className="right-calendar" onClick={nextMonth}>
          &#x276F;
        </button>
      </div>

      {/* Week Navigation + Dates */}
      <div className="calendar-nav weekdays-inside-nav">
        <button className="left-calendar" onClick={prevWeek}>
          &#x276E;
        </button>

        <div className="weekdays">
          {weekDates.map((date, index) => {
            const isPast = isPastDate(date);
            const isSelected =
              clickedDate?.toDateString() === date.toDateString();

            return (
              <div
                key={index}
                className={`day ${isSelected ? "selected" : ""} ${
                  isPast ? "disabled" : ""
                }`}
                onClick={() => handleDateClick(date)}
              >
                <span>{formatDate(date)}</span>
                <span>
                  {weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                </span>
              </div>
            );
          })}
        </div>

        <button className="right-calendar" onClick={nextWeek}>
          &#x276F;
        </button>
      </div>

      <h1 className="slot-title">Time Slots</h1>
      <section className="select-container"><input type="checkbox" checked={selectAll} onChange={handleSelectAllChange}/> <h3>Select all</h3></section>
      <div className="slot-grid">
        {slots.map((slot, index) => (
          <div
            key={index}
            ref={(el) => {
              slotRefs.current[index] = el;
            }}
            onClick={() => handleSlotClick(index)}
            className={`slot-box ${slot.status} ${
              selectedSlots.includes(index) ? "selected" : ""
            }`}
          >
            
              <>
                <div>{slot.time.split(" to ")[0]}</div>
                <div className="slot-to">to</div>
                <div>{slot.time.split(" to ")[1]}</div>
              </>
            
          </div>
        ))}
      </div>

      <section className="Notify-container"><input type="checkbox"/> <h3>Notify All Users</h3></section>


      <div className="end-buttons">
          <button className="Cancel-maintanance">Cancel</button>
          <button className="mark-maintanance" onClick={handleMarkAsMaintenance}>Mark as Maintanance</button>
        </div>


        {popupSlotIndex !== null && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-content-inner">
      <h2>Remove Maintenance</h2>
      <p>
        Do you want to remove maintenance for slot:{" "}
        <strong>{slots[popupSlotIndex].time}</strong>?
      </p>
      <div className="modal-actions">
        <button className="remove-maintanance-button"
          onClick={() => {
            setSlots((prevSlots) =>
              prevSlots.map((slot, idx) =>
                idx === popupSlotIndex ? { ...slot, status: "available" } : slot
              )
            );
            setPopupSlotIndex(null); // Close popup
          }}
        >
          Yes, Remove
        </button>
        <button className="cancel-popup-button" onClick={() => setPopupSlotIndex(null)}>Cancel</button>
      </div>
      </div>
    </div>
  </div>
)}

      {/* Internal Styles */}
      <style>{`

              .back-button {
          background: transparent;
          border: none;
          font-weight: 700;
          font-size: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
        }

        .back-button:hover {
          color: rgb(118, 123, 123);
          cursor: pointer;
        }

        .back-button img {
          width: 30px;
          height: 30px;
        }
          
              .main-container {
                font-family: sans-serif;
                height: 140%;
              }

              .heading {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 24px;
              }

      .calendar-nav button {
        background: none;
        border: none;
        font-size: 35px;
        color: black;
        cursor: pointer;
        padding: 0 20px;
      }
      .weekdays {
        display: flex;
        justify-content: center;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        gap: 12px;
        padding-bottom: 10px;
        scrollbar-width: thin; /* Firefox */
        -ms-overflow-style: auto; /* IE 10+ */
      }

      .weekdays::-webkit-scrollbar {
        height: 8px;
      }

      .weekdays::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
      }

      .weekdays::-webkit-scrollbar-track {
        background: transparent;
      }



      .day {
        background: white;
        padding: 12px 8px;
        min-height: 100px;
        min-width: 100px;
        border-radius: 5px;
        color: black;
        border: 2px solid black;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-weight: 500;

        flex-shrink: 0;

      }

      .day.disabled {
        opacity: 0.4;
        pointer-events: none;
        display: none;
      }


      .day span:first-child {
        font-size: 20px;
        font-weight: bold;
      }

      .day span:last-child {
        font-size: 20px;
        opacity: 0.8;
        margin-top: 10px;
      }

      .day.selected {
        background-color: #00c853;
        color: white;
        border: 1px solid green;
      }

      .weekdays-inside-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        
        flex-wrap: nowrap;
        overflow-x: hidden;
      }
              .select-container {
              input[type="checkbox"] {
              margin-top: 5px;
              height: 15px;
              width: 15px;
            }
              h3 {
                font-size: 20px;
            }
                display: flex;
                margin: 0 80px;
                gap: 10px;
              }
              .day {
                border: 1px solid #ccc;
                padding: 16px 12px;
                min-width: 80px;
                text-align: center;
                border-radius: 10px;
                cursor: pointer;
                background-color: #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                font-weight: 600;
              }

              .day.selected {
                background-color: #28a745;
                color: #fff;
                border-bottom: 3px solid #000;
              }

              .day.disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              .slot-title {
                text-align: center;
                margin-top: 32px;
                font-size: 20px;
              }

              .slot-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 20px;
                margin-top: 20px;
                justify-items: center;
              }

              .slot-box {
                width: 100%;
                max-width: 130px;
                min-height: 100px;
                padding: 12px;
                border-radius: 10px;
                border: 1px solid #ccc;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                text-align: center;
                font-weight: 600;
                font-size: 15px;
                line-height: 1.3;
                cursor: pointer;
              }

              .slot-box.selected {
                background-color: #e6f7ff;
                border: 2px solid #007bff;
                color: #007bff;
              }

              .slot-box.maintenance {
                background-color: #ffe5e5;
                border: 2px solid #cc0000;
                color: #cc0000;
                cursor: not-allowed;
              }

              .slot-box.disabled {
                background-color: #f2f2f2;
                color: #999;
                cursor: not-allowed;
              }

              .slot-to {
                font-size: 11px;
                font-weight: 500;
                opacity: 0.6;
              }

              .Notify-container {
                display: flex;
                margin: 50px 80px;
                gap: 10px;
                align-items: center;
                justify-content: end;
              
                input[type="checkbox"] {        
                margin-top: 5px;
                height: 15px;
                width: 15px;
                }
              }
                
              .end-buttons {
                display: flex;
                justify-content: center;
                gap: 100px;
                margin-top: 20px;
              }
              
              .mark-maintanance
              {
              height: 65px;
              width: 208px;
              background: rgba(64, 186, 54, 1);
              border: 2px solid rgba(255, 255, 255, 1);
              border-radius: 10px;
              font-size: 20px;
                cursor: pointer;

              }

              .Cancel-maintanance
              {
              height: 65px;
              width: 208px;
              background: rgba(255, 255, 255, 1);
              border: 2px solid rgba(64, 186, 54, 1);
              border-radius: 10px;
              font-size: 20px;
              cursor: pointer;

              }

              .slot-box.maintenance {
              background-color: red;
              color: white;
              cursor: not-allowed;
              }


              .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 999;
            }

            .modal-content {
              background-color: white;
              padding: 24px;
              display: grid;
              margin: 10px;
              align-items: space-between;
              border-radius: 8px;
              text-align: center;
              height: 289px;
              width: 536px;
            }
            .modal-content-inner {
            background: white;
            color: #333;
            padding: 12px 30px;
            display: flex;
            flex-direction: column;
            gap: 50px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 120px;
            }

            .modal-actions {
              margin-top: 16px;
              display: flex;
              justify-content: space-around;
            }

            .remove-maintanance-button {
              height: 40px;
              width: 160px;
              background-color:rgba(255, 0, 0, 1);
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
            }

            .cancel-popup-button {
              background-color: rgb(255, 255, 255);
              height: 40px;
              width: 160px;
              border: 2px solid rgba(217, 217, 217, 1);
              border-radius: 5px;
              color: black;
              padding: 10px 20px;
              cursor: pointer;
            }


/* Tablets (<= 768px) */
@media screen and (max-width: 768px) {
  .weekdays {
    gap: 8px;
    padding: 0 10px;
  }

  .day {
    min-width: 70px;
    min-height: 70px;
    font-size: 14px;
    padding: 10px 6px;
  }

  .day span:first-child,
  .day span:last-child {
    font-size: 16px;
  }

  .slot-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 0 10px;
  }

  .slot-box {
    max-width: 100%;
    min-height: 80px;
    font-size: 14px;
    padding: 10px;
  }

  .mark-maintanance,
  .Cancel-maintanance {
    width: 45%;
    font-size: 16px;
  }

  .end-buttons {
    // gap: 20px;
    flex-wrap: wrap;
    justify-content: space-around;
    // margin-bottom: 20px; 
  }

  .modal-content {
    width: 90%;
    padding: 20px;
  }

  .modal-content-inner {
    gap: 30px;
    font-size: 15px;
  }
}

/* Phones (<= 480px) */
@media screen and (max-width: 480px) {
.main-container {
                font-family: sans-serif;
                height: 140%;
              }
  .heading {
    font-size: 18px;
    margin-bottom: 16px;
    text-align: center;
  }

  .weekdays {
    gap: 6px;
  }

  .day {
    min-width: 60px;
    min-height: 60px;
    font-size: 13px;
    padding: 8px 4px;
  }

  .day span:first-child,
  .day span:last-child {
    font-size: 14px;
  }

  .slot-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 8px;
  }

  .slot-box {
    padding: 8px;
    font-size: 12px;
    min-height: 70px;
  }

  .end-buttons {
    flex-direction: row;
    justify-content: space-between;
    // gap: 12px;
    // padding: 0 30px;
  }

  .mark-maintanance,
  .Cancel-maintanance {
    width: 50%;
    font-size: 15px;
  }

  .modal-content {
    width: 49%;
    padding: 16px;
    height: auto;
  }

  .modal-content-inner {
    gap: 20px;
    font-size: 14px;
  }

  .remove-maintanance-button,
  .cancel-popup-button {
    width: 100%;
    font-size: 14px;
  }
}


`}</style>
    </div>
  );
};

export default Secondpage;

// Types
type SlotStatus = "available" | "booked" | "disabled" | "maintenance";

type Slot = {
  time: string;
  status: SlotStatus;
};

// Only 6 AM to 11 PM (6AM-7AM to 11PM-12AM), total 18 slots (6x3)
const defaultSlots: Slot[] = [
  { time: "6 AM to 7 AM", status: "disabled" },
  { time: "7 AM to 8 AM", status: "available" },
  { time: "8 AM to 9 AM", status: "available" },
  { time: "9 AM to 10 AM", status: "available" },
  { time: "10 AM to 11 AM", status: "available" },
  { time: "11 AM to 12 PM", status: "available" },
  { time: "12 PM to 1 PM", status: "available" },
  { time: "1 PM to 2 PM", status: "available" },
  { time: "2 PM to 3 PM", status: "available" },
  { time: "3 PM to 4 PM", status: "available" },
  { time: "4 PM to 5 PM", status: "available" },
  { time: "5 PM to 6 PM", status: "available" },
  { time: "6 PM to 7 PM", status: "available" },
  { time: "7 PM to 8 PM", status: "available" },
  { time: "8 PM to 9 PM", status: "available" },
  { time: "9 PM to 10 PM", status: "available" },
  { time: "10 PM to 11 PM", status: "available" },
  { time: "11 PM to 12 AM", status: "available" },
];