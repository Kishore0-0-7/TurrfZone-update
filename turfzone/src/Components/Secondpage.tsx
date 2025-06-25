import { useEffect, useState } from "react";
import "./Secondpage.css";
import image1 from "../assets/herosectionbgg.jpg";
import image2 from "../assets/logo.png";
import image3 from "../assets/heroImage.svg";

const images = [image1, image2, image3];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Secondpage = ({
  onScrollToThirdPage,
}: {
  onScrollToThirdPage: (date: Date) => void;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  const nextWeek = () => {
    const tentativeNext = new Date(selectedDate);
    tentativeNext.setDate(selectedDate.getDate() + maxDays); // use maxDays here!

    // If new date crosses to next month, reset to 1st of next month
    if (tentativeNext.getMonth() !== selectedDate.getMonth()) {
      const nextMonthStart = new Date(selectedDate);
      nextMonthStart.setMonth(selectedDate.getMonth() + 1);
      nextMonthStart.setDate(1);
      setSelectedDate(nextMonthStart);
    } else {
      setSelectedDate(tentativeNext);
    }
  };

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
  const [maxDays, setMaxDays] = useState(() =>
    window.innerWidth <= 480 ? 3 : 7
  );
  useEffect(() => {
    const handleResize = () => {
      setMaxDays(window.innerWidth <= 480 ? 3 : 7);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getWeekDates = () => {
    const weekDates: Date[] = [];
    const baseDate = new Date(selectedDate);
    const currentMonth = baseDate.getMonth();

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);

      if (date.getMonth() !== currentMonth) break;

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

  return (
    <div className="container">
      {/* Slider */}
      <div className="slider">
        <button className="nav-btn nav-left" onClick={prevImage}>
          &#x276E;
        </button>
        <div className="slider-image-wrapper">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Slide ${index + 1}`}
                className="slider-image"
              />
            ))}
          </div>
        </div>
        <button className="nav-btn nav-right" onClick={nextImage}>
          &#x276F;
        </button>
      </div>

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

      <div className="footer-msg">Book The Slot And Enjoy Your Day!</div>
    </div>
  );
};

export default Secondpage;
