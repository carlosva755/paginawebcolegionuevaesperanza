using AlertasService.DTOs;
using AlertasService.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlertasService.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Authenticates user credentials and issues a signed JWT token with assigned role claims.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.AuthenticateAsync(request);
        if (result == null)
        {
            return Unauthorized(new { message = "Credenciales inválidas o usuario inactivo." });
        }

        return Ok(result);
    }
}
