namespace AlertasService.Models;

/// <summary>
/// Early warning alert generated when absence or vulnerability thresholds are exceeded.
/// ETHICAL AND PRIVACY NOTE: The alert is a signal for multidisciplinary human support.
/// Under no circumstances does it represent automated exclusion or permanent student labeling.
/// </summary>
public class RiskAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }

    public RiskLevel Level { get; set; } = RiskLevel.Medio;
    public decimal Score { get; set; } // Overall score on a 0 - 100 scale
    public string TriggerReason { get; set; } = string.Empty;
    
    // Analytical alert metrics
    public decimal AttendanceAbsenceRate { get; set; } // Absence percentage in the period
    public int SurveyRiskFactorCount { get; set; } // Count of active root causes in survey

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public bool IsAcknowledged { get; set; } = false; // Reviewed by school orientation team
    public Guid? AcknowledgedByOrientadorId { get; set; }
    public DateTime? AcknowledgedAt { get; set; }

    // Human review ethical reminder visible across administrative panels
    public string EthicalHumanReviewNote { get; set; } = 
        "Las alertas son señales tempranas para orientar la intervención pedagógica y psicosocial humana. No constituyen una decisión automática ni etiquetado definitivo del estudiante.";
}
