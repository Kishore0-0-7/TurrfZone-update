import { useNavigate } from "react-router-dom";
import { useState } from "react";
import back from "../assets/back.svg";
import print from "../assets/print.svg";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Booking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handlePreviousDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const bookingData = [
    ["01", "25/05/2024", "AAAAA", "1234567890", "6:00 PM - 8:00 PM", "600", "Booked"],
    ["02", "22/11/2023", "BBBBB", "7171282922", "6:00 PM - 8:00 PM", "600", "Booked"],
    ["03", "11/07/2024", "CCCCC", "0987655433", "6:00 PM - 8:00 PM", "600", "Booked"],
    ["04", "25/01/2024", "DDDDD", "1983764452", "6:00 PM - 8:00 PM", "600", "Booked"],
    ["05", "15/05/2024", "EEEEE", "0937378944", "6:00 PM - 8:00 PM", "600", "Booked"],
    ["06", "06/05/2023", "FFFFF", "1234567878", "6:00 AM - 8:00 AM", "600", "Booked"],
  ];

  const handleExport = () => {
    const data = [
      ["No", "Date", "Name", "Phone No.", "Time", "Price in ₹", "Status"],
      ...bookingData,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, `Booking_${formatDate(selectedDate)}.xlsx`);
  };

  return (
    <>
      <div>
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={back} alt="Back" />
          Booking
        </button>

        <div className="booking-content">
          <div></div>
          <div className="date">
            <img
              src={back}
              alt="Previous"
              className="back-icon"
              onClick={handlePreviousDate}
            />
            {formatDate(selectedDate)}
            <img
              src={back}
              alt="Next"
              className="next-icon"
              onClick={handleNextDate}
            />
          </div>

          <button className="expert-button" onClick={handleExport}>
            <img src={print} alt="print" className="print-icon" />
            Export table
          </button>
        </div>

        {/* Booking Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Phone No.</th>
                <th>Time</th>
                <th>Price in ₹</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.map(([no, date, name, phone, time, price, status]) => (
                <tr key={no}>
                  <td>{no}</td>
                  <td>{date}</td>
                  <td>{name}</td>
                  <td>{phone}</td>
                  <td>{time}</td>
                  <td>{price}</td>
                  <td className="status">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

        .date {
          font-weight: 700;
          font-size: 40px;
          display: flex;
          align-items: center;
          gap: 20px;
          cursor: pointer;
        }

        .back-icon {
          width: 30px;
          height: 30px;
          cursor: pointer;
        }

        .next-icon {
          width: 30px;
          height: 30px;
          transform: rotate(180deg);
          cursor: pointer;
        }

        .booking-content {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .expert-button {
          width: 180px;
          height: 40px;
          background: black;
          color: white;
          border-radius: 5px;
          font-size: 20px;
          font-weight: 700;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .print-icon {
          width: 30px;
          height: 30px;
        }

        .table-container {
          margin-top: 20px;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 600px;
          border-collapse: separate;
          border-spacing: 0 10px;
          margin-top: 20px;
        }

        th, td {
          padding: 12px;
          text-align: center;
        }

        th {
          background-color: #006400;
          color: white;
          border: 3px solid white;
        }

        td {
          background-color: #D6D6D6;
          border-right: 3px solid black;
        }

        td:last-child {
          border-right: none;
        }

        tr {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        td.status {
          color: black;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .back-button {
            font-size: 28px;
          }

          .back-button img {
            width: 24px;
            height: 24px;
          }

          .expert-button {
            width: 160px;
            font-size: 18px;
          }

          .date {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .back-button {
            font-size: 22px;
          }

          .back-button img {
            width: 20px;
            height: 20px;
          }

          .expert-button {
            width: 100%;
            justify-content: center;
            font-size: 16px;
          }

          .date {
            font-size: 22px;
          }

          table {
            font-size: 12px;
          }

          .table-container {
            overflow-x: auto;
          }
        }
      `}</style>
    </>
  );
};

export default Booking;