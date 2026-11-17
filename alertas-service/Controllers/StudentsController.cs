using AlertasService.Data;
using AlertasService.DTOs;
using AlertasService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlertasService.Controllers;

[ApiController]
[Route("api/v1/students")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly AlertasDbContext _context;

    public StudentsController(AlertasDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Creates a baseline student profile (Authorized roles: Administrador, Orientador).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Administrador,Orientador")]
    [ProducesResponseType(typeof(StudentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
    {
        if (await _context.Students.AnyAsync(s => s.DocumentNumber == dto.DocumentNumber))
        {
            return BadRequest(new { message = $"Ya existe un estudiante con documento {dto.DocumentNumber}" });
        }

        var student = new Student
        {
            Id = Guid.NewGuid(),
            DocumentNumber = dto.DocumentNumber,
            FullName = dto.FullName,
            Grade = dto.Grade,
            BirthDate = DateTime.SpecifyKind(dto.BirthDate, DateTimeKind.Utc),
            GuardianName = dto.GuardianName,
            GuardianPhone = dto.GuardianPhone,
            GuardianEmail = dto.GuardianEmail ?? string.Empty,
            Address = dto.Address ?? string.Empty,
            Neighborhood = dto.Neighborhood ?? string.Empty,
            CurrentRiskLevel = RiskLevel.Bajo,
            RiskScore = 0m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Students.AddAsync(student);
        await _context.SaveChangesAsync();

        var responseDto = new StudentDto(
            student.Id,
            student.DocumentNumber,
            student.FullName,
            student.Grade,
            student.BirthDate,
            student.GuardianName,
            student.GuardianPhone,
            student.GuardianEmail,
            student.Address,
            student.Neighborhood,
            student.CurrentRiskLevel,
            student.RiskScore,
            student.LastRiskCalculation,
            student.CreatedAt
        );

        return CreatedAtAction(nameof(GetStudentById), new { studentId = student.Id }, responseDto);
    }

    /// <summary>
    /// Retrieves student directory with optional filtering by grade/cohort.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetStudents([FromQuery] string? grade)
    {
        var query = _context.Students.AsQueryable();

        if (!string.IsNullOrWhiteSpace(grade))
        {
            query = query.Where(s => s.Grade.ToLower() == grade.ToLower());
        }

        var students = await query
            .OrderBy(s => s.Grade)
            .ThenBy(s => s.FullName)
            .Select(s => new StudentDto(
                s.Id,
                s.DocumentNumber,
                s.FullName,
                s.Grade,
                s.BirthDate,
                s.GuardianName,
                s.GuardianPhone,
                s.GuardianEmail,
                s.Address,
                s.Neighborhood,
                s.CurrentRiskLevel,
                s.RiskScore,
                s.LastRiskCalculation,
                s.CreatedAt
            ))
            .ToListAsync();

        return Ok(students);
    }

    /// <summary>
    /// Retrieves detailed student record with attendance metrics and mandatory ethical human review disclaimer.
    /// </summary>
    [HttpGet("{studentId:guid}")]
    public async Task<IActionResult> GetStudentById(Guid studentId)
    {
        var student = await _context.Students
            .Include(s => s.Attendances)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null)
            return NotFound(new { message = "Estudiante no encontrado." });

        int totalClases = student.Attendances.Count;
        int totalAusencias = student.Attendances.Count(a => a.Status == AttendanceStatus.Ausente);
        decimal absencePercentage = totalClases > 0 ? Math.Round((decimal)totalAusencias / totalClases * 100m, 2) : 0m;

        var detail = new StudentDetailDto(
            student.Id,
            student.DocumentNumber,
            student.FullName,
            student.Grade,
            student.BirthDate,
            student.GuardianName,
            student.GuardianPhone,
            student.GuardianEmail,
            student.Address,
            student.Neighborhood,
            student.CurrentRiskLevel,
            student.RiskScore,
            student.LastRiskCalculation,
            totalAusencias,
            totalClases,
            absencePercentage,
            EthicalNote: "Las alertas son señales preventivas para el acompañamiento institucional. No constituyen un juicio ni un etiquetado permanente del estudiante."
        );

        return Ok(detail);
    }
}
