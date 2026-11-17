namespace AlertasService.Models;

/// <summary>
/// Daily classroom attendance record per student.
/// </summary>
public class Attendance
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }

    public DateTime Date { get; set; }
    public string CourseGrade { get; set; } = string.Empty;
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Presente;
    
    public Guid RegisteredByTeacherId { get; set; }
    public string? JustificationReason { get; set; }
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}
