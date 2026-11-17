using System.ComponentModel.DataAnnotations;
using AlertasService.Models;

namespace AlertasService.DTOs;

public record CreateAttendanceDto(
    [Required] Guid StudentId,
    [Required] DateTime Date,
    [Required] string CourseGrade,
    [Required] AttendanceStatus Status,
    string? JustificationReason
);

public record AttendanceDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    DateTime Date,
    string CourseGrade,
    AttendanceStatus Status,
    Guid RegisteredByTeacherId,
    string? JustificationReason,
    DateTime RegisteredAt
);

public record StudentAttendanceHistoryDto(
    Guid StudentId,
    string StudentName,
    string CourseGrade,
    int TotalClases,
    int TotalPresentes,
    int TotalAusentes,
    int TotalTardes,
    int TotalJustificadas,
    decimal AbsencePercentage,
    List<AttendanceDto> Records
);
