using Microsoft.AspNetCore.Mvc;
using Npgsql;
using turfmanagement.Connection;

namespace turfmanagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly DatabaseConnection _db;

        public BookingController(DatabaseConnection db)
        {
            _db = db;
        }

        [HttpPost("book")]
        public IActionResult BookSlot([FromBody] BookSlotDto dto)
        {
            using var conn = _db.GetConnection();
            conn.Open();
            using var tran = conn.BeginTransaction();

            try
            {
                // Check for conflicting slots first
                DateTime from = DateTime.Parse($"{dto.BookingDate:yyyy-MM-dd} {dto.SlotTimeFrom}");
                DateTime to = DateTime.Parse($"{dto.BookingDate:yyyy-MM-dd} {dto.SlotTimeTo}");

                for (DateTime time = from; time < to; time = time.AddHours(1))
                {
                    string timeStr = time.ToString("h tt"); // Format as "2 PM" to match database

                    string checkConflict = @"
                        SELECT COUNT(*) FROM Slots
                        WHERE SlotDate = @date AND SlotTime = @time;
                    ";

                    using var cmdCheck = new NpgsqlCommand(checkConflict, conn);
                    cmdCheck.Parameters.AddWithValue("@date", dto.BookingDate);
                    cmdCheck.Parameters.AddWithValue("@time", timeStr);
                    cmdCheck.Transaction = tran;

                    int conflictCount = Convert.ToInt32(cmdCheck.ExecuteScalar());
                    if (conflictCount > 0)
                    {
                        tran.Rollback();
                        return BadRequest(new { message = $"Slot at {timeStr} is already booked" });
                    }
                }

                // 1. Insert booking
                string insertBooking = @"
                    INSERT INTO Bookings (UserId, BookingDate, SlotTimeFrom, SlotTimeTo, Amount)
                    VALUES (@userId, @date, @from, @to, @amount)
                    RETURNING BookingId;
                ";

                using var cmdBooking = new NpgsqlCommand(insertBooking, conn);
                cmdBooking.Parameters.AddWithValue("@userId", dto.UserId);
                cmdBooking.Parameters.AddWithValue("@date", dto.BookingDate);
                cmdBooking.Parameters.AddWithValue("@from", dto.SlotTimeFrom);
                cmdBooking.Parameters.AddWithValue("@to", dto.SlotTimeTo);
                cmdBooking.Parameters.AddWithValue("@amount", dto.Amount);
                cmdBooking.Transaction = tran;

                int bookingId = (int)cmdBooking.ExecuteScalar();

                // 2. Insert each slot into Slots table
                for (DateTime time = from; time < to; time = time.AddHours(1))
                {
                    string timeStr = time.ToString("h tt"); // Format as "2 PM" to match database

                    string insertSlot = @"
                        INSERT INTO Slots (SlotDate, SlotTime, Status)
                        VALUES (@date, @time, 'Unavailable');
                    ";

                    using var cmdSlot = new NpgsqlCommand(insertSlot, conn);
                    cmdSlot.Parameters.AddWithValue("@date", dto.BookingDate);
                    cmdSlot.Parameters.AddWithValue("@time", timeStr);
                    cmdSlot.Transaction = tran;
                    cmdSlot.ExecuteNonQuery();
                }

                // 3. Update user's LastBookingDate
                string updateUser = @"
                    UPDATE Users
                    SET LastBookingDate = @date
                    WHERE UserId = @userId;
                ";

                using var cmdUser = new NpgsqlCommand(updateUser, conn);
                cmdUser.Parameters.AddWithValue("@date", dto.BookingDate);
                cmdUser.Parameters.AddWithValue("@userId", dto.UserId);
                cmdUser.Transaction = tran;
                cmdUser.ExecuteNonQuery();

                tran.Commit();
                return Ok(new { message = "Booking successful", bookingId });
            }
            catch (Exception ex)
            {
                tran.Rollback();
                return StatusCode(500, new { message = "Booking failed", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetBookingsByUser(int userId)
        {
            var bookings = new List<BookingDto>();

            using var conn = _db.GetConnection();
            conn.Open();

            string query = @"
                SELECT BookingId, UserId, BookingDate, SlotTimeFrom, SlotTimeTo, Amount
                FROM Bookings
                WHERE UserId = @userId
                ORDER BY BookingDate DESC, SlotTimeFrom;
            ";

            using var cmd = new NpgsqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@userId", userId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                bookings.Add(new BookingDto
                {
                    BookingId = (int)reader["BookingId"],
                    UserId = (int)reader["UserId"],
                    BookingDate = (DateTime)reader["BookingDate"],
                    SlotTimeFrom = reader["SlotTimeFrom"].ToString(),
                    SlotTimeTo = reader["SlotTimeTo"].ToString(),
                    Amount = (decimal)reader["Amount"]
                });
            }

            return Ok(bookings);
        }
    }

    public class BookSlotDto
    {
        public int UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public string SlotTimeFrom { get; set; }  // e.g., "2 PM"
        public string SlotTimeTo { get; set; }    // e.g., "5 PM"
        public decimal Amount { get; set; }
    }

    public class BookingDto
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public DateTime BookingDate { get; set; }
        public string SlotTimeFrom { get; set; }
        public string SlotTimeTo { get; set; }
        public decimal Amount { get; set; }
    }


}
