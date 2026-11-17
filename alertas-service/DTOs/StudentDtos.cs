using System.ComponentModel.DataAnnotations;
using AlertasService.Models;

namespace AlertasService.DTOs;

public record CreateStudentDto(
    [Required] string DocumentNumber,
    [Required] string FullName,
    [Required] string Grade,
    [Required] DateTime BirthDate,
    [Required] string GuardianName,
    [Required] string GuardianPhone,
    [EmailAddress] string GuardianEmail,
    string Address,
    string Neighborhood
);

public record StudentDto(
    Guid Id,
    string DocumentNumber,
    string FullName,
    string Grade,
    DateTime BirthDate,
    string GuardianName,
    string GuardianPhone,
    string GuardianEmail,
    string Address,
    string Neighborhood,
    RiskLevel CurrentRiskLevel,
    decimal RiskScore,
    DateTime? LastRiskCalculation,
    DateTime CreatedAt
);

public record StudentDetailDto(
    Guid Id,
    string DocumentNumber,
    string FullName,
    string Grade,
    DateTime BirthDate,
    string GuardianName,
    string GuardianPhone,
    string GuardianEmail,
    string Address,
    string Neighborhood,
    RiskLevel CurrentRiskLevel,
    decimal RiskScore,
    DateTime? LastRiskCalculation,
    int TotalAusencias,
    int TotalClases,
    decimal AbsencePercentage,
    string EthicalNote
);
