namespace AlertasService.Models;

/// <summary>
/// User roles with differentiated role-based access control (RBAC) permissions.
/// </summary>
public enum UserRole
{
    Administrador = 1,
    Orientador = 2,
    Docente = 3,
    Estudiante = 4
}

/// <summary>
/// Early warning risk levels designed to guide human intervention.
/// ETHICAL NOTE: Represents urgency of pedagogical and psychosocial support, not judgment on the student.
/// </summary>
public enum RiskLevel
{
    Bajo = 1,
    Medio = 2,
    Alto = 3
}

/// <summary>
/// Daily classroom attendance status values.
/// </summary>
public enum AttendanceStatus
{
    Presente = 1,
    Ausente = 2,
    Tarde = 3,
    Justificada = 4
}
