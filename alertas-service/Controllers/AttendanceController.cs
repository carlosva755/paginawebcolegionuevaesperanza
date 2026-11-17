using System.Security.Claims;
using AlertasService.Data;
using AlertasService.DTOs;
using AlertasService.Models;
using AlertasService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlertasService.Controllers;

[ApiController]
[Route("api/v1/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AlertasDbContext _context;
    private readonly IRiskCalculationService _riskService;

    public AttendanceController(AlertasDbContext context, IRiskCalculationService riskService)
    {
        _context = context;
        _riskService = riskService;
    }

    /// <summary>
    /// Records daily attendance, tardiness, or justified/unjustified absences.
    /// Triggers automated background risk recalculation.
    /// (Authorized roles: Docente, Administrador)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Docente,Administrador")]
    [ProducesResponseType(typeof(AttendanceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterAttendance([FromBody] CreateAttendanceDto dto)
    {
        var student = await _context.Students.FindAsync(dto.StudentId);
        if (student == null)
            return NotFound(new { message = "Estudiante no encontrado." });

        var dateOnly = DateTime.SpecifyKind(dto.Date.Date, DateTimeKind.Utc);

        // Check if an attendance record already exists for the student on this date
        var existing = await _context.Attendances
            .FirstOrDefaultAsync(a => a.StudentId == dto.StudentId && a.Date.Date == dateOnly.Date);

        var teacherIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(teacherIdClaim, out var teacherId);

        if (existing != null)
        {
            // Update existing record
            existing.Status = dto.Status;
            existing.JustificationReason = dto.JustificationReason;
            existing.RegisteredAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Immediately recalculate student risk
            await _riskService.CalculateStudentRiskAsync(dto.StudentId);

            var updatedDto = new AttendanceDto(
                existing.Id,
                existing.StudentId,
                student.FullName,
                existing.Date,
                existing.CourseGrade,
                existing.Status,
                existing.RegisteredByTeacherId,
                existing.JustificationReason,
                existing.RegisteredAt
            );
            return Ok(updatedDto);
        }

        var attendance = new Attendance
        {
            Id = Guid.NewGuid(),
            StudentId = dto.StudentId,
            Date = dateOnly,
            CourseGrade = dto.CourseGrade,
            Status = dto.Status,
            RegisteredByTeacherId = teacherId != Guid.Empty ? teacherId : Guid.NewGuid(),
            JustificationReason = dto.JustificationReason,
            RegisteredAt = DateTime.UtcNow
        };

        await _context.Attendances.AddAsync(attendance);
        await _context.SaveChangesAsync();

        // Trigger automated risk recalculation
        await _riskService.CalculateStudentRiskAsync(dto.StudentId);

        var responseDto = new AttendanceDto(
            attendance.Id,
            attendance.StudentId,
            student.FullName,
            attendance.Date,
            attendance.CourseGrade,
            attendance.Status,
            attendance.RegisteredByTeacherId,
            attendance.JustificationReason,
            attendance.RegisteredAt
        );

        return CreatedAtAction(nameof(GetAttendanceByStudent), new { studentId = attendance.StudentId }, responseDto);
    }

    /// <summary>
    /// Retrieves complete attendance history for an authorized student.
    /// (Authorized roles: Docente, Orientador, Administrador, Estudiante)
    /// </summary>
    [HttpGet("{studentId:guid}")]
    public async Task<IActionResult> GetAttendanceByStudent(Guid studentId)
    {
        var student = await _context.Students.FindAsync(studentId);
        if (student == null)
            return NotFound(new { message = "Estudiante no encontrado." });

        var records = await _context.Attendances
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .Select(a => new AttendanceDto(
                a.Id,
                a.StudentId,
                student.FullName,
                a.Date,
                a.CourseGrade,
                a.Status,
                a.RegisteredByTeacherId,
                a.JustificationReason,
                a.RegisteredAt
            ))
            .ToListAsync();

        int totalClases = records.Count;
        int ausentes = records.Count(r => r.Status == AttendanceStatus.Ausente);
        int presentes = records.Count(r => r.Status == AttendanceStatus.Presente);
        int tardes = records.Count(r => r.Status == AttendanceStatus.Tarde);
        int justificadas = records.Count(r => r.Status == AttendanceStatus.Justificada);
        decimal absenceRate = totalClases > 0 ? Math.Round((decimal)ausentes / totalClases * 100m, 2) : 0m;

        var history = new StudentAttendanceHistoryDto(
            student.Id,
            student.FullName,
            student.Grade,
            totalClases,
            presentes,
            ausentes,
            tardes,
            justificadas,
            absenceRate,
            records
        );

        return Ok(history);
    }
}
