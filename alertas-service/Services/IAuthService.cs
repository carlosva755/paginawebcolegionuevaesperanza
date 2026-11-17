using AlertasService.DTOs;

namespace AlertasService.Services;

/// <summary>
/// Service contract for user authentication and JWT token generation.
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDto?> AuthenticateAsync(LoginRequestDto request);
    string GenerateJwtToken(Models.User user);
}
