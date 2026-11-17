using System.ComponentModel.DataAnnotations;

namespace AlertasService.DTOs;

public record CreateSurveyResponseDto(
    [Required] Guid StudentId,
    bool HasEconomicHardship,
    bool WorksOrCaresFamily,
    bool TransportationDifficulty,
    bool FeelsAcademicSupportLacking,
    bool LowMotivationOrBelonging,
    bool ExperiencedConflictOrBullying,
    string? QualitativeFeedback,
    bool HasGuardianConsent
);

public record SurveyResponseDto(
    Guid Id,
    Guid StudentId,
    string StudentName,
    DateTime SurveyDate,
    bool HasEconomicHardship,
    bool WorksOrCaresFamily,
    bool TransportationDifficulty,
    bool FeelsAcademicSupportLacking,
    bool LowMotivationOrBelonging,
    bool ExperiencedConflictOrBullying,
    string? QualitativeFeedback,
    decimal RiskContributionScore,
    bool HasGuardianConsent
);
