using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AlertasService.Data;
using AlertasService.DTOs;
using AlertasService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AlertasService.Services;

public class AuthService : IAuthService
{
    private readonly AlertasDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AlertasDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto?> AuthenticateAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive);

        if (user == null)
            return null;

        bool passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordMatches)
            return null;

        var token = GenerateJwtToken(user);
        var refreshToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        int expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);

        return new AuthResponseDto(
            Token: token,
            RefreshToken: refreshToken,
            ExpiresAt: DateTime.UtcNow.AddMinutes(expirationMinutes),
            User: new UserDto(user.Id, user.Email, user.FullName, user.Role, user.DocumentNumber)
        );
    }

    public string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "ClaveSecretaSuperSeguraParaJWTEnNuevaEsperanzaSoacha2026Minimo32Caracteres!";
        var issuer = _configuration["Jwt:Issuer"] ?? "NuevaEsperanzaAuthServer";
        var audience = _configuration["Jwt:Audience"] ?? "NuevaEsperanzaPlatform";
        var expirationMinutes = _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60);

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("documentNumber", user.DocumentNumber),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
