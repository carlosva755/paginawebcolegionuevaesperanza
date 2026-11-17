using AlertasService.Models;
using Microsoft.EntityFrameworkCore;

namespace AlertasService.Data;

/// <summary>
/// Database initializer and realistic seed data provider.
/// Target population: 60 students (8th to 11th grade), 10 teachers, 20 representative guardians,
/// attendance records for the past month, wellness surveys based on the Problem Tree, and initial alerts.
/// </summary>
public static class DbInitializer
{
    public static async Task SeedAsync(AlertasDbContext context)
    {
        // Ensure database schema is created
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // Database has already been seeded
        }

        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123*");
        var orientadorHash = BCrypt.Net.BCrypt.HashPassword("Orientador123*");
        var docenteHash = BCrypt.Net.BCrypt.HashPassword("Docente123*");
        var estudianteHash = BCrypt.Net.BCrypt.HashPassword("Estudiante123*");

        // 1. Seed Institutional Users
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@nuevaesperanza.edu.co",
            PasswordHash = defaultPasswordHash,
            FullName = "Administrador de Sistemas IED",
            Role = UserRole.Administrador,
            DocumentNumber = "1023456789",
            IsActive = true
        };

        var orientadorUser = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email = "orientador@nuevaesperanza.edu.co",
            PasswordHash = orientadorHash,
            FullName = "Lic. María Paula Restrepo",
            Role = UserRole.Orientador,
            DocumentNumber = "52345678",
            IsActive = true
        };

        var directivoUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "directivo@nuevaesperanza.edu.co",
            PasswordHash = defaultPasswordHash,
            FullName = "Rector Carlos Hernán Gómez",
            Role = UserRole.Orientador, // Institutional supervision scope
            DocumentNumber = "19485721",
            IsActive = true
        };

        await context.Users.AddRangeAsync(adminUser, orientadorUser, directivoUser);

        // 10 Secondary school teachers
        var docentesNombres = new[]
        {
            "Pedro Julio Morales - Matemáticas",
            "Diana Marcela Forero - Lengua Castellana",
            "Javier Orlando Mora - Ciencias Naturales",
            "Claudia Patricia Ramos - Ciencias Sociales",
            "Andrés Felipe Quiroga - Educación Física",
            "Rosa Helena Cárdenas - Inglés",
            "Guillermo León Gómez - Tecnología",
            "Mónica Andrea Pinzón - Ética y Valores",
            "Diego Fernando Vargas - Artística",
            "Sonia Esperanza Castro - Filosofía"
        };

        var docentesList = new List<User>();
        for (int i = 0; i < docentesNombres.Length; i++)
        {
            var doc = new User
            {
                Id = Guid.NewGuid(),
                Email = $"docente{i + 1}@nuevaesperanza.edu.co",
                PasswordHash = docenteHash,
                FullName = docentesNombres[i],
                Role = UserRole.Docente,
                DocumentNumber = $"{80100200 + i}",
                IsActive = true
            };
            docentesList.Add(doc);
        }
        await context.Users.AddRangeAsync(docentesList);

        // 20 Representative student guardians
        var acudientes = new[]
        {
            ("Rosa Elvira Mendoza", "3102345678", "rosa.mendoza@correo.com", "Calle 15 # 4-20", "San Mateo"),
            ("Luis Alberto Quintero", "3118765432", "luis.quintero@correo.com", "Transversal 8 # 2-15", "León XIII"),
            ("Carmen Cecilia Ortiz", "3123456789", "carmen.ortiz@correo.com", "Carrera 9 # 18-34", "Cazucá"),
            ("Héctor Fabio Benítez", "3139876543", "hector.benitez@correo.com", "Diagonal 4 # 12-50", "Compartir"),
            ("Martha Rocío Beltrán", "3145678901", "martha.beltran@correo.com", "Calle 38 Sur # 14-10", "Ciudad Verde"),
            ("José Vicente Romero", "3156789012", "jose.romero@correo.com", "Carrera 7 # 3-45", "Soacha Centro"),
            ("Gloria Inés Salcedo", "3167890123", "gloria.salcedo@correo.com", "Calle 22 # 9-80", "San Humberto"),
            ("Jorge Enrique Pardo", "3178901234", "jorge.pardo@correo.com", "Transversal 12 # 5-60", "La Despensa"),
            ("Blanca Nubia Parra", "3189012345", "blanca.parra@correo.com", "Carrera 4 # 11-22", "El Altico"),
            ("Wilson David Chivatá", "3190123456", "wilson.chivata@correo.com", "Calle 10 # 6-30", "Ducales"),
            ("Esperanza Rincón", "3201234567", "esperanza.rincon@correo.com", "Carrera 8 # 14-55", "San Mateo"),
            ("Jairo Alonso Garzón", "3212345678", "jairo.garzon@correo.com", "Calle 16 # 3-12", "León XIII"),
            ("Yolanda Guatibonza", "3223456789", "yolanda.guatibonza@correo.com", "Diagonal 6 # 9-40", "Cazucá"),
            ("Carlos Julio Monroy", "3234567890", "carlos.monroy@correo.com", "Calle 7 # 12-18", "Compartir"),
            ("Ana Mercedes Pachón", "3245678901", "ana.pachon@correo.com", "Carrera 15 # 20-33", "Ciudad Verde"),
            ("Manuel Salvador Roa", "3256789012", "manuel.roa@correo.com", "Transversal 3 # 8-70", "Soacha Centro"),
            ("Doris Adriana Melo", "3267890123", "doris.melo@correo.com", "Calle 29 # 10-14", "San Humberto"),
            ("Hernando Cuervo", "3278901234", "hernando.cuervo@correo.com", "Carrera 6 # 5-82", "La Despensa"),
            ("Flor Alba Fonseca", "3289012345", "flor.fonseca@correo.com", "Calle 13 # 2-90", "El Altico"),
            ("Orlando Naranjo", "3290123456", "orlando.naranjo@correo.com", "Carrera 11 # 18-05", "Ducales")
        };

        // 60 Students distributed across grades (8-A, 8-B, 9-A, 9-B, 10-A, 10-B, 11-A, 11-B)
        var cursos = new[] { "8-A", "8-B", "9-A", "9-B", "10-A", "10-B", "11-A", "11-B" };
        var nombresEstudiantes = new[]
        {
            "Santiago Morales Roa", "Valentina Rojas Ortiz", "Mateo Gómez Beltrán", "Sofía Quintero Salcedo",
            "Samuel Pardo Chivatá", "Isabella Rincón Parra", "David Leonardo Monroy", "Mariana Garzón Benítez",
            "Juan Diego Pachón", "Camila Andrea Roa", "Nicolás Melo Fonseca", "Gabriela Cuervo Naranjo",
            "Sebastián Romero Guatibonza", "Laura Vanessa Mendoza", "Felipe Silva Chivatá", "Daniela Forero Parra",
            "Alejandro Cárdenas Melo", "Natalia Vargas Pachón", "Andrés Camilo Castro", "Paula Tatiana Monroy",
            "Diego Alejandro Ortiz", "Catalina Gómez Pardo", "Julián David Beltrán", "Manuela Quintero Roa",
            "Esteban Morales Salcedo", "Luciana Rincón Melo", "Brayan Alexis Garzón", "Geraldine Cuervo Fonseca",
            "Cristian Camilo Naranjo", "Karen Dayana Mendoza", "Kevin Andrés Guatibonza", "Yurani Paola Benítez",
            "Johan Sebastián Roa", "Angie Lorena Monroy", "Duván Felipe Romero", "Leidy Johana Chivatá",
            "Yeison David Parra", "Tatiana Marcela Pachón", "Brandon Stiven Cuervo", "Erika Johanna Fonseca",
            "Jhonatan David Naranjo", "Kelly Tatiana Ortiz", "Maicol Steven Mendoza", "Ingrid Paola Quintero",
            "Yeimi Katherine Beltrán", "Nelson Enrique Salcedo", "Diana Carolina Rincón", "Harold David Garzón",
            "Lina María Benítez", "Miller Alexis Monroy", "Jennyfer Paola Roa", "Brayan Steven Melo",
            "Jessica Viviana Cuervo", "Oscar Mauricio Fonseca", "Yenny Astrid Naranjo", "Deisy Johanna Ortiz",
            "Wilmer Alexander Romero", "Marisol Pachón Chivatá", "Fabian Andrés Guatibonza", "Heidy Tatiana Pardo"
        };

        var studentsList = new List<Student>();
        var random = new Random(42); // Fixed seed for reproducible generation

        for (int i = 0; i < 60; i++)
        {
            var acudiente = acudientes[i % acudientes.Length];
            var curso = cursos[i % cursos.Length];
            var docNum = $"1098{760000 + i:D6}";

            var student = new Student
            {
                Id = Guid.NewGuid(),
                DocumentNumber = docNum,
                FullName = nombresEstudiantes[i],
                Grade = curso,
                BirthDate = DateTime.UtcNow.AddYears(-14 - (i / 15)).AddDays(-random.Next(1, 300)),
                GuardianName = acudiente.Item1,
                GuardianPhone = acudiente.Item2,
                GuardianEmail = acudiente.Item3,
                Address = acudiente.Item4,
                Neighborhood = acudiente.Item5,
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                UpdatedAt = DateTime.UtcNow
            };
            studentsList.Add(student);
        }

        // Demo student user for direct login
        var demoStudentUser = new User
        {
            Id = studentsList[0].Id,
            Email = "estudiante@nuevaesperanza.edu.co",
            PasswordHash = estudianteHash,
            FullName = studentsList[0].FullName,
            Role = UserRole.Estudiante,
            DocumentNumber = studentsList[0].DocumentNumber,
            IsActive = true
        };
        await context.Users.AddAsync(demoStudentUser);
        await context.Students.AddRangeAsync(studentsList);
        await context.SaveChangesAsync();

        // 3. Generate attendance records for past 20 school days
        var attendances = new List<Attendance>();
        var teacherId = docentesList[0].Id;
        var today = DateTime.UtcNow.Date;

        for (int dayOffset = 20; dayOffset >= 1; dayOffset--)
        {
            var date = today.AddDays(-dayOffset);
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                continue;

            for (int sIndex = 0; sIndex < studentsList.Count; sIndex++)
            {
                var student = studentsList[sIndex];
                // Simulate attendance pattern matching Problem Tree findings (42% repeated absences)
                AttendanceStatus status = AttendanceStatus.Presente;
                string? motivo = null;

                if (sIndex < 8 && dayOffset % 3 == 0)
                {
                    status = AttendanceStatus.Ausente;
                    motivo = "Sin justificación reportada";
                }
                else if (sIndex >= 8 && sIndex < 20 && dayOffset % 5 == 0)
                {
                    status = AttendanceStatus.Ausente;
                    motivo = "Falta por dificultad de transporte/recursos";
                }
                else if (sIndex >= 20 && sIndex < 25 && dayOffset == 7)
                {
                    status = AttendanceStatus.Justificada;
                    motivo = "Cita médica EPS Soacha";
                }
                else if (dayOffset % 8 == 0 && sIndex % 7 == 0)
                {
                    status = AttendanceStatus.Tarde;
                    motivo = "Congestión vehicular Autopista Sur";
                }

                attendances.Add(new Attendance
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Date = date,
                    CourseGrade = student.Grade,
                    Status = status,
                    RegisteredByTeacherId = teacherId,
                    JustificationReason = motivo,
                    RegisteredAt = date.AddHours(8)
                });
            }
        }
        await context.Attendances.AddRangeAsync(attendances);
        await context.SaveChangesAsync();

        // 4. Generate wellness survey responses reflecting Soacha sample statistics
        var surveyResponses = new List<SurveyResponse>();
        for (int i = 0; i < studentsList.Count; i++)
        {
            var s = studentsList[i];
            // Problem Tree root cause distribution: 37% econ, 28% work, 25% transport, 31% support, 35% motivation
            bool econ = (i % 3 == 0); // ~33%
            bool work = (i % 4 == 0); // ~25%
            bool trans = (i % 4 == 1); // ~25%
            bool aca = (i % 3 == 1); // ~33%
            bool motiv = (i % 3 == 2); // ~33%
            bool bully = (i % 8 == 0);

            decimal riskContrib = 0m;
            if (econ) riskContrib += 20m;
            if (work) riskContrib += 25m;
            if (trans) riskContrib += 15m;
            if (aca) riskContrib += 15m;
            if (motiv) riskContrib += 20m;
            if (bully) riskContrib += 15m;

            string? comentario = null;
            if (trans) comentario = "Llego tarde porque los colectivos en Cazucá no pasan seguido y el pasaje está muy caro.";
            else if (econ) comentario = "A veces me falta para materiales y ayudar a mi mamá cuidando a mis hermanos menores.";
            else if (motiv) comentario = "Siento que me quedo atrasado en matemáticas y no entiendo las tareas.";

            surveyResponses.Add(new SurveyResponse
            {
                Id = Guid.NewGuid(),
                StudentId = s.Id,
                SurveyDate = DateTime.UtcNow.AddDays(-15),
                HasEconomicHardship = econ,
                WorksOrCaresFamily = work,
                TransportationDifficulty = trans,
                FeelsAcademicSupportLacking = aca,
                LowMotivationOrBelonging = motiv,
                ExperiencedConflictOrBullying = bully,
                RiskContributionScore = riskContrib,
                QualitativeFeedback = comentario,
                HasGuardianConsent = true
            });
        }
        await context.SurveyResponses.AddRangeAsync(surveyResponses);
        await context.SaveChangesAsync();

        // 5. Calculate and seed initial early warning alerts
        var riskAlerts = new List<RiskAlert>();
        foreach (var student in studentsList)
        {
            var studentAtts = attendances.Where(a => a.StudentId == student.Id).ToList();
            var studentSurvey = surveyResponses.FirstOrDefault(sr => sr.StudentId == student.Id);

            int totalClases = studentAtts.Count;
            int totalAusencias = studentAtts.Count(a => a.Status == AttendanceStatus.Ausente);
            decimal absenceRate = totalClases > 0 ? (decimal)totalAusencias / totalClases * 100m : 0m;

            int surveyFactors = 0;
            decimal surveyScore = 0m;
            if (studentSurvey != null)
            {
                if (studentSurvey.HasEconomicHardship) surveyFactors++;
                if (studentSurvey.WorksOrCaresFamily) surveyFactors++;
                if (studentSurvey.TransportationDifficulty) surveyFactors++;
                if (studentSurvey.FeelsAcademicSupportLacking) surveyFactors++;
                if (studentSurvey.LowMotivationOrBelonging) surveyFactors++;
                if (studentSurvey.ExperiencedConflictOrBullying) surveyFactors++;
                surveyScore = studentSurvey.RiskContributionScore;
            }

            // Weighted formula: 50% Attendance + 50% Wellness survey indicators
            decimal score = Math.Min(100m, (absenceRate * 2.5m) + (surveyScore * 0.5m));
            student.RiskScore = Math.Round(score, 2);
            student.LastRiskCalculation = DateTime.UtcNow;

            RiskLevel level;
            string trigger;

            if (score >= 60m || totalAusencias >= 4)
            {
                level = RiskLevel.Alto;
                trigger = $"Alerta Alta: {totalAusencias} inasistencias acumuladas y {surveyFactors} factores de vulnerabilidad activa.";
            }
            else if (score >= 35m || totalAusencias >= 2)
            {
                level = RiskLevel.Medio;
                trigger = $"Alerta Media: {totalAusencias} ausencias recientes con alerta socioeconómica o académica.";
            }
            else
            {
                level = RiskLevel.Bajo;
                trigger = "Seguimiento preventivo regular. Buen nivel de asistencia y permanencia.";
            }

            student.CurrentRiskLevel = level;

            // Generate formal alert record if Medium or High risk
            if (level != RiskLevel.Bajo)
            {
                riskAlerts.Add(new RiskAlert
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Level = level,
                    Score = student.RiskScore,
                    TriggerReason = trigger,
                    AttendanceAbsenceRate = Math.Round(absenceRate, 2),
                    SurveyRiskFactorCount = surveyFactors,
                    GeneratedAt = DateTime.UtcNow.AddDays(-random.Next(1, 10)),
                    IsAcknowledged = false,
                    EthicalHumanReviewNote = "Nota orientadora: Alerta temprana pedagógica. No constituye sanción escolar ni etiquetado permanente."
                });
            }
        }

        await context.RiskAlerts.AddRangeAsync(riskAlerts);
        await context.SaveChangesAsync();
    }
}
