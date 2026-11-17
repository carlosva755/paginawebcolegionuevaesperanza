using AlertasService.Models;

namespace AlertasService.DTOs;

public record RiskAlertDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    string DocumentNumber,
    string Grade,
    string GuardianName,
    string GuardianPhone,
    RiskLevel Level,
    decimal Score,
    string TriggerReason,
    decimal AttendanceAbsenceRate,
    int SurveyRiskFactorCount,
    DateTime GeneratedAt,
    bool IsAcknowledged,
    string EthicalHumanReviewNote
);

public record RecalculateRiskRequestDto(
    Guid? StudentId,
    string? Grade
);

public record RecalculateRiskResponseDto(
    int TotalProcessed,
    int HighAlertsCount,
    int MediumAlertsCount,
    int LowRiskCount,
    DateTime RecalculatedAt,
    string Message
);
