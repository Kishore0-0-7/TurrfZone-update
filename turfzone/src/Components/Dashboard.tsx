import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,

} from 'recharts';

const bookingData = [
  { month: 'Jan', bookings: 5, color: '#FF5733' },
  { month: 'Feb', bookings: 30, color: '#33C1FF' },
  { month: 'Mar', bookings: 12, color: '#FFC300' },
  { month: 'Apr', bookings: 25, color: '#DAF7A6' },
  { month: 'May', bookings: 78, color: '#C70039' },
  { month: 'Jun', bookings: 24, color: '#900C3F' },
  { month: 'Jul', bookings: 50, color: '#581845' },
  { month: 'Aug', bookings: 15, color: '#4CAF50' },
  { month: 'Sep', bookings: 28, color: '#FF9800' },
  { month: 'Oct', bookings: 65, color: '#3F51B5' },
  { month: 'Nov', bookings: 40, color: '#E91E63' },
  { month: 'Dec', bookings: 25, color: '#795548' },
];

function Dashboard() {
  return (
    <>
      <div>
        <button className="back">Dashboard</button>

        <div className="dashboard-container">
          <div className="graph-content">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="linear"
                    dataKey="bookings"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={({ cx, cy, payload }) => (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        stroke="#000"
                        strokeWidth={1}
                        fill={payload.color}
                      />
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            
            </div>
            
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <span>Today</span>
              <span>- 10</span>
            </div>
            <div className="summary-card">
              <span>Upcoming</span>
              <span>- 10</span>
            </div>
            <div className="summary-card">
              <span>Past</span>
              <span>- 50</span>
            </div>
          </div>
        </div>
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

        .dashboard-container {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .graph-content {
          flex: 2;
        }

        .chart-box {
          width: 100%;
          height: 300px;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        .summary-cards {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .summary-card {
          background-color: white;
          border: 1px solid black;
          border-radius: 8px;
          padding: 20px;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 768px) {
          .back {
            width: 160px;
            height: 50px;
            font-size: 28px;
          }

          .dashboard-container {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .back {
            width: 140px;
            height: 44px;
            font-size: 22px;
          }

          .summary-card {
         
            font-size: 16px;
            padding: 16px;
          }

          .chart-box {
            height: 250px;
            margin-bottom: 90px;
          }
        }

        .custom-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-left: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
  border: 1px solid #000;
}

.legend-label {
  font-size: 14px;
}

      `}</style>
    </>
  );
}

export default Dashboard;
