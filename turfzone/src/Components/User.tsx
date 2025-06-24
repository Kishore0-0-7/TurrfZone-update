import { useLocation, useNavigate } from "react-router-dom";
import "./User.css"; // Assuming you have a CSS file for styling

const User = () => {
  const location = useLocation();
  const { no, date, name, phone, upcoming } = location.state || {};
  const navigate = useNavigate();


  return (
    <div className="user-container">
      <h2 className="user-header" onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>&larr; Users</h2>
      <div className="user-details">
        <div>
          <p>Name: <span>{name}</span></p>
          <p>Contact: <span>{phone}</span></p>
        </div>
        <div className="total-booking">
          <p>Total booking : 8</p>
        </div>
      </div>

      <div className="user-tables">
        {/* History Table */}
        <table className="user-table">
          <thead>
            <tr>
              <th>No</th>
              <th>History</th>
              <th>Time Slot</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>01</td>
              <td>{date}</td>
              <td>6:00 AM - 8:00 AM</td>
            </tr>
          </tbody>
        </table>

        {/* Upcoming Table */}
        <table className="user-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Upcoming</th>
              <th>Time Slot</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>01</td>
              <td>{upcoming?.split(" ")[0]}</td>
              <td>{upcoming?.split(" ").slice(1).join(" ")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;