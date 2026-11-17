using AlertasService.Data;
using AlertasService.DTOs;
using AlertasService.Models;
using AlertasService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlertasService.Controllers;

[ApiController]
[Route("api/v1/surveys")]
[Authorize]
public class SurveysController : ControllerBase
{
    private readonly AlertasDbContext _context;
    private readonly IRiskCalculationService _riskService;

    public SurveysController(AlertasDbContext context, IRiskCalculationService riskService)
    {
        _context = context;
        _riskService = riskService;
    }

    /// <summary>
    /// Submits student wellness survey responses and triggers risk recalculation.
    /// (Authorized roles: Estudiante, Orientador, Administrador)
    /// </summary>
    [HttpPost("responses")]
    [ProducesResponseType(typeof(SurveyResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> SubmitSurvey([FromBody] CreateSurveyResponseDto dto)
    {
        var student = await _context.Students.FindAsync(dto.StudentId);
        if (student == null)
            return NotFound(new { message = "Estudiante no encontrado." });

        decimal riskScore = 0m;
        if (dto.HasEconomicHardship) riskScore += 20m;
        if (dto.WorksOrCaresFamily) riskScore += 25m;
        if (dto.TransportationDifficulty) riskScore += 15m;
        if (dto.FeelsAcademicSupportLacking) riskScore += 15m;
        if (dto.LowMotivationOrBelonging) riskScore += 20m;
        if (dto.ExperiencedConflictOrBullying) riskScore += 15m;

        var survey = new SurveyResponse
        {
            Id = Guid.NewGuid(),
            StudentId = dto.StudentId,
            SurveyDate = DateTime.UtcNow,
            HasEconomicHardship = dto.HasEconomicHardship,
            WorksOrCaresFamily = dto.WorksOrCaresFamily,
            TransportationDifficulty = dto.TransportationDifficulty,
            FeelsAcademicSupportLacking = dto.FeelsAcademicSupportLacking,
            LowMotivationOrBelonging = dto.LowMotivationOrBelonging,
            ExperiencedConflictOrBullying = dto.ExperiencedConflictOrBullying,
            QualitativeFeedback = dto.QualitativeFeedback,
            RiskContributionScore = riskScore,
            HasGuardianConsent = dto.HasGuardianConsent
        };

        await _context.SurveyResponses.AddAsync(survey);
        await _context.SaveChangesAsync();

        // Recalculate integrated student risk level
        await _riskService.CalculateStudentRiskAsync(dto.StudentId);

        var responseDto = new SurveyResponseDto(
            survey.Id,
            survey.StudentId,
            student.FullName,
            survey.SurveyDate,
            survey.HasEconomicHardship,
            survey.WorksOrCaresFamily,
            survey.TransportationDifficulty,
            survey.FeelsAcademicSupportLacking,
            survey.LowMotivationOrBelonging,
            survey.ExperiencedConflictOrBullying,
            survey.QualitativeFeedback,
            survey.RiskContributionScore,
            survey.HasGuardianConsent
        );

        return CreatedAtAction(nameof(GetSurveysByStudent), new { studentId = survey.StudentId }, responseDto);
    }

    /// <summary>
    /// Retrieves historical wellness surveys registered for a student.
    /// </summary>
    [HttpGet("responses/{studentId:guid}")]
    public async Task<IActionResult> GetSurveysByStudent(Guid studentId)
    {
        var student = await _context.Students.FindAsync(studentId);
        if (student == null)
            return NotFound(new { message = "Estudiante no encontrado." });

        var surveys = await _context.SurveyResponses
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SurveyDate)
            .Select(s => new SurveyResponseDto(
                s.Id,
                s.StudentId,
                student.FullName,
                s.SurveyDate,
                s.HasEconomicHardship,
                s.WorksOrCaresFamily,
                s.TransportationDifficulty,
                s.FeelsAcademicSupportLacking,
                s.LowMotivationOrBelonging,
                s.ExperiencedConflictOrBullying,
                s.QualitativeFeedback,
                s.RiskContributionScore,
                s.HasGuardianConsent
            ))
            .ToListAsync();

        return Ok(surveys);
    }
}
