using Microsoft.AspNetCore.Mvc;
using Npgsql;
using turfmanagement.Connection;
using System.Globalization;

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
            Console.WriteLine($"📥 Received booking request:");
            Console.WriteLine($"  UserId: {dto.UserId}");
            Console.WriteLine($"  BookingDate: {dto.BookingDate}");
            Console.WriteLine($"  SlotTimeFrom: {dto.SlotTimeFrom}");
            Console.WriteLine($"  SlotTimeTo: {dto.SlotTimeTo}");
            Console.WriteLine($"  Amount: {dto.Amount}");

            using var conn = _db.GetConnection();
            conn.Open();
            using var tran = conn.BeginTransaction();

            try
            {
                // Parse the booking date from string
                if (!DateTime.TryParse(dto.BookingDate, out DateTime bookingDate))
                {
                    return BadRequest(new { message = "Invalid date format" });
                }

                // Insert booking
                string insertBooking = @"
                    INSERT INTO Bookings (UserId, BookingDate, SlotTimeFrom, SlotTimeTo, Amount)
                    VALUES (@userId, @date, @from, @to, @amount)
                    RETURNING BookingId;
                ";

                using var cmdBooking = new NpgsqlCommand(insertBooking, conn);
                cmdBooking.Parameters.AddWithValue("@userId", dto.UserId);
                cmdBooking.Parameters.AddWithValue("@date", bookingDate.Date);
                cmdBooking.Parameters.AddWithValue("@from", dto.SlotTimeFrom);
                cmdBooking.Parameters.AddWithValue("@to", dto.SlotTimeTo);
                cmdBooking.Parameters.AddWithValue("@amount", dto.Amount);
                cmdBooking.Transaction = tran;

                int bookingId = (int)cmdBooking.ExecuteScalar();

                // Insert each slot into Slots table
                try
                {
                    // Parse times - frontend sends "2 PM" format
                    DateTime from = DateTime.ParseExact(dto.SlotTimeFrom, "h tt", CultureInfo.InvariantCulture);
                    DateTime to = DateTime.ParseExact(dto.SlotTimeTo, "h tt", CultureInfo.InvariantCulture);

                    for (DateTime time = from; time < to; time = time.AddHours(1))
                    {
                        string timeStr = time.ToString("h tt"); // Format as "2 PM" to match frontend

                        string insertSlot = @"
                            INSERT INTO Slots (SlotDate, SlotTime, Status)
                            VALUES (@date, @time, 'Unavailable');
                        ";

                        using var cmdSlot = new NpgsqlCommand(insertSlot, conn);
                        cmdSlot.Parameters.AddWithValue("@date", bookingDate.Date);
                        cmdSlot.Parameters.AddWithValue("@time", timeStr);
                        cmdSlot.Transaction = tran;
                        cmdSlot.ExecuteNonQuery();
                    }
                }
                catch (FormatException ex)
                {
                    tran.Rollback();
                    return BadRequest(new { message = $"Invalid time format: {ex.Message}" });
                }

                // Update user's LastBookingDate
                string updateUser = @"
                    UPDATE Users
                    SET LastBookingDate = @date
                    WHERE UserId = @userId;
                ";

                using var cmdUser = new NpgsqlCommand(updateUser, conn);
                cmdUser.Parameters.AddWithValue("@date", bookingDate.Date);
                cmdUser.Parameters.AddWithValue("@userId", dto.UserId);
                cmdUser.Transaction = tran;
                cmdUser.ExecuteNonQuery();

                tran.Commit();
                Console.WriteLine($"✅ Booking successful with ID: {bookingId}");
                return Ok(new { message = "Booking successful", bookingId });
            }
            catch (Exception ex)
            {
                tran.Rollback();
                Console.WriteLine($"❌ Booking failed: {ex.Message}");
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
                    BookingDate = ((DateTime)reader["BookingDate"]).ToString("yyyy-MM-dd"),
                    SlotTimeFrom = reader["SlotTimeFrom"].ToString(),
                    SlotTimeTo = reader["SlotTimeTo"].ToString(),
                    Amount = (decimal)reader["Amount"]
                });
            }

            return Ok(bookings);
        }

        [HttpGet("all")]
        public IActionResult GetAllBookings()
        {
            var bookings = new List<BookingDto>();

            using var conn = _db.GetConnection();
            conn.Open();

            string query = @"
                SELECT BookingId, UserId, BookingDate, SlotTimeFrom, SlotTimeTo, Amount
                FROM Bookings
                ORDER BY BookingDate DESC, SlotTimeFrom;
            ";

            using var cmd = new NpgsqlCommand(query, conn);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                bookings.Add(new BookingDto
                {
                    BookingId = (int)reader["BookingId"],
                    UserId = (int)reader["UserId"],
                    BookingDate = ((DateTime)reader["BookingDate"]).ToString("yyyy-MM-dd"),
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
        public string BookingDate { get; set; }  // "2025-06-24"
        public string SlotTimeFrom { get; set; }  // "02:00 PM"
        public string SlotTimeTo { get; set; }    // "05:00 PM"
        public decimal Amount { get; set; }
    }

    public class BookingDto
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public string BookingDate { get; set; }
        public string SlotTimeFrom { get; set; }
        public string SlotTimeTo { get; set; }
        public decimal Amount { get; set; }
    }
}
