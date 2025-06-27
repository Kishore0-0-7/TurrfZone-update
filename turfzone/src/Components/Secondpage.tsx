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

  const [currentSlide, setCurrentSlide] = useState(0); // for image carousel
  const [clickedDate, setClickedDate] = useState<Date>(today);
  const [dateSlide, setDateSlide] = useState(0); // for date slider
  const [daysPerSlide, setDaysPerSlide] = useState(getDaysPerSlide());

  const maxDays = 15;

  function getDaysPerSlide() {
    const width = window.innerWidth;
    if (width <= 360) return 3;
    if (width <= 480) return 4;
    return 5;
  }

  const totalSlides = Math.ceil(maxDays / (daysPerSlide || 1));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDaysPerSlide(getDaysPerSlide());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allDates: Date[] = Array.from({ length: maxDays }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const visibleDates = allDates.slice(
    dateSlide * daysPerSlide,
    dateSlide * daysPerSlide + daysPerSlide
  );

  const nextImage = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  const nextDateSlide = () => {
    if (dateSlide < totalSlides - 1) setDateSlide((prev) => prev + 1);
  };

  const prevDateSlide = () => {
    if (dateSlide > 0) setDateSlide((prev) => prev - 1);
  };

  const handleDateClick = (date: Date) => {
    setClickedDate(date);
    onScrollToThirdPage(date);
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  return (
    <div className="container">
      {/* Image Slider */}
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

      {/* Month Label */}
      <div className="calendar-nav">
        <span>
          {clickedDate.toLocaleString("default", { month: "long" })}{" "}
          {clickedDate.getFullYear()}
        </span>
      </div>

      {/* Date Slider */}
      <div className="calendar-nav weekdays-inside-nav">
        <button
          className="left-calendar"
          onClick={prevDateSlide}
          disabled={dateSlide === 0}
        >
          &#x276E;
        </button>

        <div className="weekdays">
          {visibleDates.map((date, index) => {
            const isSelected =
              clickedDate?.toDateString() === date.toDateString();
            return (
              <div
                key={index}
                className={`day ${isSelected ? "selected" : ""} ${
                  isToday(date) ? "today" : ""
                }`}
                onClick={() => handleDateClick(date)}
              >
                <span>{date.getDate()}</span>
                <span>
                  {weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                </span>
              </div>
            );
          })}
        </div>

        <button
          className="right-calendar"
          onClick={nextDateSlide}
          disabled={dateSlide === totalSlides - 1}
        >
          &#x276F;
        </button>
      </div>

      <div className="footer-msg">Book The Slot And Enjoy Your Day!</div>
    </div>
  );
};

export default Secondpage;
