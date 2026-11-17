using AlertasService.Models;
using AlertasService.Services;
using Xunit;

namespace AlertasService.Tests;

public class RiskCalculationServiceTests
{
    private readonly RiskCalculationService _service;

    public RiskCalculationServiceTests()
    {
        // Pass null context as pure risk evaluation logic does not depend on database state
        _service = new RiskCalculationService(null!);
    }

    [Fact]
    public void EvaluateRisk_WithZeroAbsencesAndCleanSurvey_ShouldReturnLowRisk()
    {
        // Arrange
        decimal absenceRate = 0m;
        int totalAbsences = 0;
        var survey = new SurveyResponse
        {
            HasEconomicHardship = false,
            WorksOrCaresFamily = false,
            TransportationDifficulty = false,
            FeelsAcademicSupportLacking = false,
            LowMotivationOrBelonging = false,
            ExperiencedConflictOrBullying = false
        };

        // Act
        var (level, score, reason) = _service.EvaluateRisk(absenceRate, totalAbsences, survey);

        // Assert
        Assert.Equal(RiskLevel.Bajo, level);
        Assert.True(score < 35m);
        Assert.Contains("Riesgo Bajo", reason);
    }

    [Fact]
    public void EvaluateRisk_WithFourAbsences_ShouldTriggerImmediateHighRisk()
    {
        // Arrange: 4 absences out of 10 classes (40% absence rate)
        decimal absenceRate = 40m;
        int totalAbsences = 4;
        SurveyResponse? survey = null;

        // Act
        var (level, score, reason) = _service.EvaluateRisk(absenceRate, totalAbsences, survey);

        // Assert
        Assert.Equal(RiskLevel.Alto, level);
        Assert.Contains("Riesgo Alto", reason);
        Assert.Contains("4 ausencias", reason);
    }

    [Fact]
    public void EvaluateRisk_WithCriticalSoachaFactors_ShouldIncreaseScoreAndRaiseAlert()
    {
        // Arrange: Student facing Cazucá transit difficulties and family work responsibilities
        decimal absenceRate = 15m;
        int totalAbsences = 2;
        var survey = new SurveyResponse
        {
            HasEconomicHardship = true, // +20
            WorksOrCaresFamily = true,  // +25
            TransportationDifficulty = true, // +15
            FeelsAcademicSupportLacking = false,
            LowMotivationOrBelonging = true, // +20
            ExperiencedConflictOrBullying = false
        };

        // Act
        var (level, score, reason) = _service.EvaluateRisk(absenceRate, totalAbsences, survey);

        // Assert
        Assert.True(level == RiskLevel.Medio || level == RiskLevel.Alto);
        Assert.True(score >= 35m);
        Assert.NotNull(reason);
    }
}
