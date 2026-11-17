using AlertasService.Data;
using AlertasService.DTOs;
using AlertasService.Models;
using Microsoft.EntityFrameworkCore;

namespace AlertasService.Services;

/// <summary>
/// Student dropout risk calculation engine based on Problem Tree empirical findings:
/// Factors: Repeated absences (42%), Economic hardship (37%), Work/Family care (28%),
/// Commute difficulty in Soacha (25%), Insufficient academic leveling (31%), Low motivation (35%).
/// </summary>
public class RiskCalculationService : IRiskCalculationService
{
    private readonly AlertasDbContext _context;

    public RiskCalculationService(AlertasDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Pure function evaluating composite risk from absence rate, count of absences, and wellness survey factors.
    /// </summary>
    public (RiskLevel Level, decimal Score, string TriggerReason) EvaluateRisk(
        decimal absenceRate,
        int totalAbsences,
        SurveyResponse? survey)
    {
        decimal surveyScore = 0m;
        int activeFactors = 0;

        if (survey != null)
        {
            if (survey.HasEconomicHardship) { surveyScore += 20m; activeFactors++; }
            if (survey.WorksOrCaresFamily) { surveyScore += 25m; activeFactors++; }
            if (survey.TransportationDifficulty) { surveyScore += 15m; activeFactors++; }
            if (survey.FeelsAcademicSupportLacking) { surveyScore += 15m; activeFactors++; }
            if (survey.LowMotivationOrBelonging) { surveyScore += 20m; activeFactors++; }
            if (survey.ExperiencedConflictOrBullying) { surveyScore += 15m; activeFactors++; }
        }

        // Weighted score: 50% Attendance component (up to 50 pts) + 50% Wellness component (up to 50 pts)
        decimal attendanceComponent = Math.Min(50m, absenceRate * 2.5m);
        decimal surveyComponent = Math.Min(50m, surveyScore * 0.5m);
        decimal finalScore = Math.Round(attendanceComponent + surveyComponent, 2);

        RiskLevel level;
        string reason;

        if (finalScore >= 60m || totalAbsences >= 4)
        {
            level = RiskLevel.Alto;
            reason = $"Riesgo Alto: {totalAbsences} ausencias registradas y {activeFactors} factores críticos de vulnerabilidad (Puntaje: {finalScore}/100).";
        }
        else if (finalScore >= 35m || totalAbsences >= 2)
        {
            level = RiskLevel.Medio;
            reason = $"Riesgo Medio: {totalAbsences} inasistencias o señales socioeconómicas preventivas (Puntaje: {finalScore}/100).";
        }
        else
        {
            level = RiskLevel.Bajo;
            reason = $"Riesgo Bajo: Asistencia regular y estabilidad en factores de bienestar (Puntaje: {finalScore}/100).";
        }

        return (level, finalScore, reason);
    }

    /// <summary>
    /// Computes and persists individual risk assessment for a specific student.
    /// </summary>
    public async Task<RiskAlert?> CalculateStudentRiskAsync(Guid studentId)
    {
        var student = await _context.Students
            .Include(s => s.Attendances)
            .Include(s => s.SurveyResponses)
            .FirstOrDefaultAsync(s => s.Id == studentId);

        if (student == null)
            return null;

        var totalClases = student.Attendances.Count;
        var totalAbsences = student.Attendances.Count(a => a.Status == AttendanceStatus.Ausente);
        decimal absenceRate = totalClases > 0 ? (decimal)totalAbsences / totalClases * 100m : 0m;

        var latestSurvey = student.SurveyResponses.OrderByDescending(sr => sr.SurveyDate).FirstOrDefault();

        var (level, score, reason) = EvaluateRisk(absenceRate, totalAbsences, latestSurvey);

        student.CurrentRiskLevel = level;
        student.RiskScore = score;
        student.LastRiskCalculation = DateTime.UtcNow;
        student.UpdatedAt = DateTime.UtcNow;

        RiskAlert? newAlert = null;
        if (level != RiskLevel.Bajo)
        {
            int surveyCount = 0;
            if (latestSurvey != null)
            {
                if (latestSurvey.HasEconomicHardship) surveyCount++;
                if (latestSurvey.WorksOrCaresFamily) surveyCount++;
                if (latestSurvey.TransportationDifficulty) surveyCount++;
                if (latestSurvey.FeelsAcademicSupportLacking) surveyCount++;
                if (latestSurvey.LowMotivationOrBelonging) surveyCount++;
                if (latestSurvey.ExperiencedConflictOrBullying) surveyCount++;
            }

            newAlert = new RiskAlert
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                Level = level,
                Score = score,
                TriggerReason = reason,
                AttendanceAbsenceRate = Math.Round(absenceRate, 2),
                SurveyRiskFactorCount = surveyCount,
                GeneratedAt = DateTime.UtcNow,
                IsAcknowledged = false,
                EthicalHumanReviewNote = "Nota orientadora: Alerta temprana formativa para intervención psicosocial. No constituye una sanción ni etiquetado permanente."
            };

            await _context.RiskAlerts.AddAsync(newAlert);
        }

        await _context.SaveChangesAsync();
        return newAlert;
    }

    /// <summary>
    /// Performs batch recalculation across all students or a filtered grade cohort.
    /// </summary>
    public async Task<RecalculateRiskResponseDto> RecalculateAllAsync(RecalculateRiskRequestDto? request)
    {
        var query = _context.Students
            .Include(s => s.Attendances)
            .Include(s => s.SurveyResponses)
            .AsQueryable();

        if (request?.StudentId.HasValue == true)
        {
            query = query.Where(s => s.Id == request.StudentId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(request?.Grade))
        {
            query = query.Where(s => s.Grade.ToLower() == request.Grade.ToLower());
        }

        var students = await query.ToListAsync();

        int highCount = 0;
        int mediumCount = 0;
        int lowCount = 0;

        foreach (var student in students)
        {
            var totalClases = student.Attendances.Count;
            var totalAbsences = student.Attendances.Count(a => a.Status == AttendanceStatus.Ausente);
            decimal absenceRate = totalClases > 0 ? (decimal)totalAbsences / totalClases * 100m : 0m;

            var latestSurvey = student.SurveyResponses.OrderByDescending(sr => sr.SurveyDate).FirstOrDefault();
            var (level, score, reason) = EvaluateRisk(absenceRate, totalAbsences, latestSurvey);

            student.CurrentRiskLevel = level;
            student.RiskScore = score;
            student.LastRiskCalculation = DateTime.UtcNow;
            student.UpdatedAt = DateTime.UtcNow;

            if (level == RiskLevel.Alto) highCount++;
            else if (level == RiskLevel.Medio) mediumCount++;
            else lowCount++;

            if (level != RiskLevel.Bajo)
            {
                int surveyCount = 0;
                if (latestSurvey != null)
                {
                    if (latestSurvey.HasEconomicHardship) surveyCount++;
                    if (latestSurvey.WorksOrCaresFamily) surveyCount++;
                    if (latestSurvey.TransportationDifficulty) surveyCount++;
                    if (latestSurvey.FeelsAcademicSupportLacking) surveyCount++;
                    if (latestSurvey.LowMotivationOrBelonging) surveyCount++;
                    if (latestSurvey.ExperiencedConflictOrBullying) surveyCount++;
                }

                var alert = new RiskAlert
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Level = level,
                    Score = score,
                    TriggerReason = reason,
                    AttendanceAbsenceRate = Math.Round(absenceRate, 2),
                    SurveyRiskFactorCount = surveyCount,
                    GeneratedAt = DateTime.UtcNow,
                    IsAcknowledged = false,
                    EthicalHumanReviewNote = "Nota orientadora: Alerta temprana formativa para intervención psicosocial. No constituye una sanción ni etiquetado permanente."
                };
                await _context.RiskAlerts.AddAsync(alert);
            }
        }

        await _context.SaveChangesAsync();

        return new RecalculateRiskResponseDto(
            TotalProcessed: students.Count,
            HighAlertsCount: highCount,
            MediumAlertsCount: mediumCount,
            LowRiskCount: lowCount,
            RecalculatedAt: DateTime.UtcNow,
            Message: $"Recálculo ejecutado exitosamente para {students.Count} estudiantes."
        );
    }
}
