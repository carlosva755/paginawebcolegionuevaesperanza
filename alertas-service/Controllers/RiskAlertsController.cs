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
[Route("api/v1/risk-alerts")]
[Authorize]
public class RiskAlertsController : ControllerBase
{
    private readonly AlertasDbContext _context;
    private readonly IRiskCalculationService _riskService;

    public RiskAlertsController(AlertasDbContext context, IRiskCalculationService riskService)
    {
        _context = context;
        _riskService = riskService;
    }

    /// <summary>
    /// Retrieves active alerts filtered by severity level (low/medium/high) and grade.
    /// (Authorized roles: Orientador, Administrador, Docente)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Orientador,Administrador,Docente")]
    public async Task<IActionResult> GetAlerts([FromQuery] string? level, [FromQuery] string? grade)
    {
        var query = _context.RiskAlerts
            .Include(a => a.Student)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(level))
        {
            var lvl = level.Trim().ToLower();
            if (lvl == "high" || lvl == "alto")
                query = query.Where(a => a.Level == RiskLevel.Alto);
            else if (lvl == "medium" || lvl == "medio")
                query = query.Where(a => a.Level == RiskLevel.Medio);
            else if (lvl == "low" || lvl == "bajo")
                query = query.Where(a => a.Level == RiskLevel.Bajo);
        }

        if (!string.IsNullOrWhiteSpace(grade))
        {
            query = query.Where(a => a.Student != null && a.Student.Grade.ToLower() == grade.ToLower());
        }

        var alerts = await query
            .OrderByDescending(a => a.GeneratedAt)
            .Select(a => new RiskAlertDto(
                a.Id,
                a.StudentId,
                a.Student != null ? a.Student.FullName : "Estudiante",
                a.Student != null ? a.Student.DocumentNumber : "",
                a.Student != null ? a.Student.Grade : "",
                a.Student != null ? a.Student.GuardianName : "",
                a.Student != null ? a.Student.GuardianPhone : "",
                a.Level,
                a.Score,
                a.TriggerReason,
                a.AttendanceAbsenceRate,
                a.SurveyRiskFactorCount,
                a.GeneratedAt,
                a.IsAcknowledged,
                a.EthicalHumanReviewNote
            ))
            .ToListAsync();

        return Ok(alerts);
    }

    /// <summary>
    /// Triggers batch recalculation of early warning risk rules across student cohorts.
    /// (Authorized roles: Administrador, Orientador)
    /// </summary>
    [HttpPost("recalculate")]
    [Authorize(Roles = "Administrador,Orientador")]
    public async Task<IActionResult> RecalculateRisk([FromBody] RecalculateRiskRequestDto? request)
    {
        var result = await _riskService.RecalculateAllAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Marks an alert as reviewed/acknowledged by the school orientation team.
    /// </summary>
    [HttpPatch("{alertId:guid}/acknowledge")]
    [Authorize(Roles = "Orientador,Administrador")]
    public async Task<IActionResult> AcknowledgeAlert(Guid alertId)
    {
        var alert = await _context.RiskAlerts.FindAsync(alertId);
        if (alert == null)
            return NotFound(new { message = "Alerta no encontrada." });

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdClaim, out var orientadorId);

        alert.IsAcknowledged = true;
        alert.AcknowledgedByOrientadorId = orientadorId != Guid.Empty ? orientadorId : null;
        alert.AcknowledgedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Alerta marcada como revisada por orientación.", alertId = alert.Id });
    }
}
