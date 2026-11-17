using Microsoft.EntityFrameworkCore;
using AlertasService.Models;

namespace AlertasService.Data;

/// <summary>
/// Database context for the Alerts and Risk Microservice (PostgreSQL).
/// </summary>
public class AlertasDbContext : DbContext
{
    public AlertasDbContext(DbContextOptions<AlertasDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<SurveyResponse> SurveyResponses => Set<SurveyResponse>();
    public DbSet<RiskAlert> RiskAlerts => Set<RiskAlert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
        });

        // Student entity configuration
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.DocumentNumber).IsUnique();
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Grade).IsRequired().HasMaxLength(20);
            entity.Property(e => e.RiskScore).HasPrecision(5, 2);
        });

        // Attendance entity configuration
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.StudentId, e.Date }).IsUnique();
            entity.HasOne(e => e.Student)
                  .WithMany(s => s.Attendances)
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SurveyResponse entity configuration
        modelBuilder.Entity<SurveyResponse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RiskContributionScore).HasPrecision(5, 2);
            entity.HasOne(e => e.Student)
                  .WithMany(s => s.SurveyResponses)
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // RiskAlert entity configuration
        modelBuilder.Entity<RiskAlert>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Score).HasPrecision(5, 2);
            entity.Property(e => e.AttendanceAbsenceRate).HasPrecision(5, 2);
            entity.HasIndex(e => e.Level);
            entity.HasOne(e => e.Student)
                  .WithMany(s => s.RiskAlerts)
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
