using AlertasService.DTOs;
using AlertasService.Models;

namespace AlertasService.Services;

/// <summary>
/// Service contract for student dropout risk calculation and batch recalculation.
/// </summary>
public interface IRiskCalculationService
{
    Task<RiskAlert?> CalculateStudentRiskAsync(Guid studentId);
    Task<RecalculateRiskResponseDto> RecalculateAllAsync(RecalculateRiskRequestDto? request);
    (RiskLevel Level, decimal Score, string TriggerReason) EvaluateRisk(decimal absenceRate, int totalAbsences, SurveyResponse? survey);
}
