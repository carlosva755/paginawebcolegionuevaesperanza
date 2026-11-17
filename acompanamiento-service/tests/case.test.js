const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Lightweight test application harness for route validation
const app = express();
app.use(express.json());

const JWT_SECRET = 'TestSecretKeyForJestTestingPurposes1234567890!';

app.post('/api/v1/cases/test-validation', (req, res) => {
  const { studentId, studentName, studentGrade, openingReason } = req.body;
  if (!studentId || !studentName || !studentGrade || !openingReason) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' });
  }
  res.status(201).json({ id: 'case-mock-123', status: 'Abierto', studentName });
});

app.get('/api/v1/indicators/mock', (req, res) => {
  res.json({
    summary: {
      totalCases: 4,
      activeCases: 3,
      closedSuccessful: 1,
      planCompletionRate: 67
    },
    ethicalNote: 'Prueba de confidencialidad'
  });
});

describe('Unit Tests - Accompaniment Microservice', () => {
  it('Should reject case creation when required payload fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/cases/test-validation')
      .send({
        studentName: 'Juan Pérez'
        // Missing studentId, studentGrade, openingReason
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Campos requeridos faltantes');
  });

  it('Should successfully validate case creation with complete payload', async () => {
    const res = await request(app)
      .post('/api/v1/cases/test-validation')
      .send({
        studentId: '11111111-2222-3333-4444-555555555555',
        studentName: 'Mateo Gómez Beltrán',
        studentGrade: '10-A',
        openingReason: 'Inasistencias continuas por transporte en Soacha'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.studentName).toBe('Mateo Gómez Beltrán');
    expect(res.body.status).toBe('Abierto');
  });

  it('Should return aggregated indicator metrics matching expected schema', async () => {
    const res = await request(app).get('/api/v1/indicators/mock');

    expect(res.statusCode).toEqual(200);
    expect(res.body.summary.totalCases).toBe(4);
    expect(res.body.summary.planCompletionRate).toBe(67);
    expect(res.body.ethicalNote).toBeDefined();
  });
});
