import { useNavigate } from "react-router-dom";
import back from "../assets/back.svg";
import print from "../assets/print.svg";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Booking = () => {
  const navigate = useNavigate();

  const bookingData = [
    ["01", "25/05/2024", "AAAAA", "1234567890", "Login"],
    ["02", "22/11/2023", "BBBBB", "7171282922", "Logout"],
    ["03", "11/07/2024", "CCCCC", "0987655433", "Login"],
    ["04", "25/01/2024", "DDDDD", "1983764452", "Login"],
    ["05", "15/05/2024", "EEEEE", "0937378494", "Login"],
    ["06", "06/05/2023", "FFFFF", "1234567878", "Login"],
    ["07", "06/05/2023", "GGGGG", "5555555567", "Logout"],
    ["01", "25/05/2024", "AAAAA", "1234567890", "Login"],
    ["02", "22/11/2023", "BBBBB", "7171282922", "Logout"],
    ["03", "11/07/2024", "CCCCC", "0987655433", "Login"],
  ];

  const handleExport = () => {
    const worksheetData = [
      ["No", "Last booking", "Name", "Phone No.", "Status"],
      ...bookingData,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "Bookings.xlsx");
  };

  return (
    <>
      <div>
        <button className="back" onClick={() => navigate(-1)}>
          <img src={back} alt="back" className="back" />
          User
        </button>

        <div className="booking-content">
          <div></div>
          <button className="expert-button" onClick={handleExport}>
            <img src={print} alt="print" className="print-icon" />
            Export Table
          </button>
        </div>

        <div className="table-container p-4">
          <table className="w-full border border-collapse">
            <thead>
              <tr className="bg-green-800 text-white text-left">
                <th className="p-2 border">No</th>
                <th className="p-2 border">Last booking</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Phone No.</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.map(([no, date, name, phone, status], index) => (
                <tr key={index} className="border">
                  <td className="p-2 border">{no}</td>
                  <td className="p-2 border">{date}</td>
                  <td className="p-2 border">{name}</td>
                  <td className="p-2 border">{phone}</td>
                  <td className="p-2 border">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <style>{`
  .back {
    width: 200px;
    height: 61px;
    background: transparent;
    border: none;
    font-weight: 700;
    font-size: 40px;
    display: flex;
    align-items: center;
  }

  .back:hover {
    color: rgb(118, 123, 123);
    cursor: pointer;
  }

  .back img {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }

  .back-icon {
    width: 30px;
    height: 30px;
    margin-right: 40px;
  }

  .next-icon {
    width: 30px;
    height: 30px;
    margin-left: 40px;
    transform: rotate(180deg);
  }

  .booking-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
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
    min-width: 100%;
    width: 100%;
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

  @media (max-width: 1024px) {
    table {
      margin-left: 0;
    }
  }

  @media (max-width: 768px) {
    .back {
      width: 160px;
      height: 50px;
      font-size: 28px;
    }
    .back img {
      width: 24px;
      height: 24px;
    }
    .expert-button {
      font-size: 18px;
      height: 36px;
    }
  }

  @media (max-width: 480px) {
    .back {
      width: 140px;
      height: 44px;
      font-size: 22px;
    }
    .back img {
      width: 20px;
      height: 20px;
    }
    .expert-button {
      font-size: 16px;
      width: 100%;
      justify-content: center;
      gap: 8px;
    }
    table {
      font-size: 12px;
      min-width: 600px;
    }
    .table-container {
      overflow-x: auto;
    }
  }
`}</style>

      </div>
    </>
  );
};

export default Booking;
