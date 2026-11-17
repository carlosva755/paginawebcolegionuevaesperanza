const bcrypt = require('bcryptjs');
const { User, Case, Action, Notification } = require('../models');

async function seedAcompanamientoData() {
  const usersCount = await User.count();
  if (usersCount > 0) {
    return; // Database has already been seeded
  }

  console.log('Seeding initial data into acompanamiento_db...');

  const passwordHash = await bcrypt.hash('Orientador123*', 10);
  const adminHash = await bcrypt.hash('Admin123*', 10);
  const directivoHash = await bcrypt.hash('Directivo123*', 10);

  // 1. Seed Accompaniment Service Users
  const orientador = await User.create({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'orientador@nuevaesperanza.edu.co',
    passwordHash: passwordHash,
    fullName: 'Lic. María Paula Restrepo',
    role: 'Orientador',
    documentNumber: '52345678',
    isActive: true
  });

  const directivo = await User.create({
    email: 'directivo@nuevaesperanza.edu.co',
    passwordHash: directivoHash,
    fullName: 'Rector Carlos Hernán Gómez',
    role: 'Directivo',
    documentNumber: '19485721',
    isActive: true
  });

  const admin = await User.create({
    email: 'admin@nuevaesperanza.edu.co',
    passwordHash: adminHash,
    fullName: 'Administrador General IED',
    role: 'Administrador',
    documentNumber: '1023456789',
    isActive: true
  });

  const docenteLider = await User.create({
    email: 'docente.lider@nuevaesperanza.edu.co',
    passwordHash: passwordHash,
    fullName: 'Prof. Pedro Julio Morales (Director 8-A)',
    role: 'ResponsableAsignado',
    documentNumber: '80100200',
    isActive: true
  });

  // 2. Sample accompaniment cases for grades 8th to 11th
  const casosData = [
    {
      studentId: '22222222-2222-2222-2222-222222222201',
      studentName: 'Santiago Morales Roa',
      studentGrade: '8-A',
      openingReason: 'Inasistencias continuas los lunes y viernes debido a dificultades de transporte desde Altos de Cazucá y apoyo laboral familiar.',
      status: 'EnSeguimiento',
      priority: 'Alta',
      assignedOrientadorId: orientador.id,
      assignedOrientadorName: orientador.fullName,
      humanInterventionGoal: 'Vincular a la ruta de transporte escolar municipal y ajustar horario de llegada para evitar rezago.',
      actions: [
        {
          title: 'Comunicación con acudiente (Rosa Elvira Mendoza)',
          description: 'Llamada telefónica para indagar motivos de ausencias los días viernes.',
          assignedTo: 'Lic. María Paula Restrepo',
          roleResponsible: 'Orientador',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'Completada',
          evidenceDescription: 'La madre informa que el joven ayuda a cuidar a su abuela enferma y el costo del colectivo subió. Se acuerda entrevista.'
        },
        {
          title: 'Firma de Acta de Compromiso Pedagógico',
          description: 'Reunión en sala de orientación con estudiante y acudiente para plan de entregas flexibles.',
          assignedTo: 'Prof. Pedro Julio Morales',
          roleResponsible: 'Docente Director',
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          status: 'EnProgreso'
        },
        {
          title: 'Postulación a Subsidio de Transporte Soacha',
          description: 'Radicar formulario ante Secretaría de Educación para ruta escolar en Comuna 4 Cazucá.',
          assignedTo: 'Lic. María Paula Restrepo',
          roleResponsible: 'Orientador',
          dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          status: 'Pendiente'
        }
      ],
      notification: {
        recipientType: 'Acudiente',
        recipientName: 'Rosa Elvira Mendoza',
        recipientContact: '3102345678',
        contactChannel: 'WhatsApp',
        messageContent: 'Estimada Sra. Rosa, cordial saludo de Orientación IED Nueva Esperanza. La invitamos el jueves 8:00 a.m. para coordinar apoyo académico para Santiago.'
      }
    },
    {
      studentId: '22222222-2222-2222-2222-222222222202',
      studentName: 'Valentina Rojas Ortiz',
      studentGrade: '9-B',
      openingReason: 'Baja motivación escolar manifestada en encuesta de bienestar y reiteradas tardanzas por congestión vial en León XIII.',
      status: 'EnSeguimiento',
      priority: 'Media',
      assignedOrientadorId: orientador.id,
      assignedOrientadorName: orientador.fullName,
      humanInterventionGoal: 'Fortalecer el proyecto de vida y sentido de pertenencia institucional mediante talleres vocacionales.',
      actions: [
        {
          title: 'Sesión de orientación vocacional y escucha activa',
          description: 'Entrevista individual con la estudiante para explorar intereses en media técnica.',
          assignedTo: 'Lic. María Paula Restrepo',
          roleResponsible: 'Orientador',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'Completada',
          evidenceDescription: 'Valentina muestra interés por el programa técnico en Desarrollo de Software y Robótica escolar.'
        },
        {
          title: 'Remisión a grupo de apoyo estudiantil',
          description: 'Participación en semillero juvenil de liderazgo de los miércoles.',
          assignedTo: 'Lic. María Paula Restrepo',
          roleResponsible: 'Orientador',
          dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          status: 'Pendiente'
        }
      ],
      notification: {
        recipientType: 'Acudiente',
        recipientName: 'Luis Alberto Quintero',
        recipientContact: '3118765432',
        contactChannel: 'SMS',
        messageContent: 'IED Nueva Esperanza informa: Valentina asistió hoy a sesión orientadora de bienestar con balance muy positivo. Agradecemos su constante apoyo.'
      }
    },
    {
      studentId: '22222222-2222-2222-2222-222222222203',
      studentName: 'Mateo Gómez Beltrán',
      studentGrade: '10-A',
      openingReason: 'Rezago académico en tres asignaturas y riesgo de deserción por propuesta de empleo informal en comercio local.',
      status: 'Abierto',
      priority: 'Alta',
      assignedOrientadorId: orientador.id,
      assignedOrientadorName: orientador.fullName,
      humanInterventionGoal: 'Garantizar permanencia hacia la culminación de la educación media e inscripción al programa SENA articulado.',
      actions: [
        {
          title: 'Convocatoria urgente a acudiente para entrevista presencial',
          description: 'Sensibilización sobre los riesgos de deserción prematura y beneficios de culminar grado 11.',
          assignedTo: 'Lic. María Paula Restrepo',
          roleResponsible: 'Orientador',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'Pendiente'
        }
      ],
      notification: {
        recipientType: 'Acudiente',
        recipientName: 'Carmen Cecilia Ortiz',
        recipientContact: '3123456789',
        contactChannel: 'CitacionPresencial',
        messageContent: 'Citación Oficial: Orientación Escolar requiere su presencia el martes 14 a las 9:30 a.m. para tratar situación académica y de permanencia de Mateo.'
      }
    },
    {
      studentId: '22222222-2222-2222-2222-222222222204',
      studentName: 'Sofía Quintero Salcedo',
      studentGrade: '11-B',
      openingReason: 'Dificultades de conectividad y materiales para pruebas Saber 11 superadas satisfactoriamente tras plan de apoyo escolar.',
      status: 'CerradoExitosa',
      priority: 'Baja',
      assignedOrientadorId: orientador.id,
      assignedOrientadorName: orientador.fullName,
      humanInterventionGoal: 'Culminación exitosa del grado 11 e ingreso a educación superior.',
      closureNotes: 'Estudiante nivelada, asistencia regularizada al 98%, asignado préstamo de equipo en sala de informática y beca pre-ICFES.',
      closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      actions: [
        {
          title: 'Asignación de computador en jornada contraria',
          description: 'Facilitar acceso a biblioteca institucional para talleres y tareas.',
          assignedTo: 'Prof. Guillermo León Gómez',
          roleResponsible: 'Docente Tecnología',
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: 'Completada',
          evidenceDescription: 'Equipo asignado en aula 3 de cómputo. Registro de uso verificado.'
        }
      ]
    }
  ];

  for (const cData of casosData) {
    const createdCase = await Case.create({
      studentId: cData.studentId,
      studentName: cData.studentName,
      studentGrade: cData.studentGrade,
      openingReason: cData.openingReason,
      status: cData.status,
      priority: cData.priority,
      assignedOrientadorId: cData.assignedOrientadorId,
      assignedOrientadorName: cData.assignedOrientadorName,
      humanInterventionGoal: cData.humanInterventionGoal,
      closureNotes: cData.closureNotes || null,
      closedAt: cData.closedAt || null
    });

    if (cData.actions && cData.actions.length > 0) {
      for (const aData of cData.actions) {
        await Action.create({
          caseId: createdCase.id,
          title: aData.title,
          description: aData.description,
          assignedTo: aData.assignedTo,
          roleResponsible: aData.roleResponsible,
          dueDate: aData.dueDate,
          status: aData.status,
          evidenceDescription: aData.evidenceDescription || null,
          completedAt: aData.status === 'Completada' ? new Date() : null
        });
      }
    }

    if (cData.notification) {
      await Notification.create({
        caseId: createdCase.id,
        studentName: createdCase.studentName,
        recipientType: cData.notification.recipientType,
        recipientName: cData.notification.recipientName,
        recipientContact: cData.notification.recipientContact,
        contactChannel: cData.notification.contactChannel,
        messageContent: cData.notification.messageContent,
        status: 'Entregado',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      });
    }
  }

  console.log('Seeding of acompanamiento_db completed successfully.');
}

module.exports = { seedAcompanamientoData };
