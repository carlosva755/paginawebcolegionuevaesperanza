namespace AlertasService.Models;

/// <summary>
/// Student wellness survey responses based on the Problem Tree root causes
/// identified at IED Nueva Esperanza (Soacha).
/// </summary>
public class SurveyResponse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }

    public DateTime SurveyDate { get; set; } = DateTime.UtcNow;

    // Dimensions derived from the Problem Tree
    public bool HasEconomicHardship { get; set; } // Household economic hardship (37%)
    public bool WorksOrCaresFamily { get; set; } // Need to work or care for family members (28%)
    public bool TransportationDifficulty { get; set; } // Long commute, cost, or insecurity in transit (25%)
    public bool FeelsAcademicSupportLacking { get; set; } // Insufficient academic leveling support (31%)
    public bool LowMotivationOrBelonging { get; set; } // Low motivation and weak sense of belonging (35%)
    public bool ExperiencedConflictOrBullying { get; set; } // Rejection, conflict, or bullying experiences

    public string? QualitativeFeedback { get; set; } // Open qualitative feedback from student
    public decimal RiskContributionScore { get; set; } // Aggregated risk score contribution
    public bool HasGuardianConsent { get; set; } = true; // Informed consent flag
}
