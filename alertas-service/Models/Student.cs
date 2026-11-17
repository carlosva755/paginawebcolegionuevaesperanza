namespace AlertasService.Models;

/// <summary>
/// Student entity enrolled in IED Nueva Esperanza (Soacha).
/// Represents students from grades 8th through 11th tracked for school retention.
/// </summary>
public class Student
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DocumentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty; // e.g. "8-A", "9-B", "10-A", "11-B"
    public DateTime BirthDate { get; set; }
    
    // Guardian contact details for tracking and support
    public string GuardianName { get; set; } = string.Empty;
    public string GuardianPhone { get; set; } = string.Empty;
    public string GuardianEmail { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty; // Soacha communes: Cazucá, León XIII, Compartir, etc.

    // Dynamic calculated indicators (non-permanent)
    public RiskLevel CurrentRiskLevel { get; set; } = RiskLevel.Bajo;
    public decimal RiskScore { get; set; } = 0.0m; // 0 to 100 scale
    public DateTime? LastRiskCalculation { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<SurveyResponse> SurveyResponses { get; set; } = new List<SurveyResponse>();
    public ICollection<RiskAlert> RiskAlerts { get; set; } = new List<RiskAlert>();
}
