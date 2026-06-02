require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./prisma');
const { authenticate, requireAdmin } = require('./middlewares/auth');

const app = express();
app.use(cors());
app.use(express.json());

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !user.isActive) return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
  
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// --- DASHBOARD ROUTES ---
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsToday = await prisma.appointment.findMany({
      where: { date: { gte: today, lte: endOfDay } },
      include: { patient: true }
    });

    const lowStockItems = await prisma.inventoryItem.findMany({
      where: { stock: { lte: 5 } }
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringItems = await prisma.inventoryItem.findMany({
      where: { expiryDate: { lte: thirtyDaysFromNow, gte: new Date() } }
    });

    const recentConsultations = await prisma.consultation.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { patient: true }
    });

    // Basic cashflow if admin
    let cashFlow = { income: 0, expense: 0 };
    if (req.user.role === 'ADMIN') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const txs = await prisma.cashTransaction.findMany({
        where: { date: { gte: firstDayOfMonth } }
      });
      cashFlow.income = txs.filter(t => t.type === 'INGRESO').reduce((acc, t) => acc + t.amount, 0);
      cashFlow.expense = txs.filter(t => t.type === 'EGRESO').reduce((acc, t) => acc + t.amount, 0);
    }

    res.json({ appointmentsToday, lowStockItems, expiringItems, recentConsultations, cashFlow });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PATIENT ROUTES ---
app.get('/api/patients', authenticate, async (req, res) => {
  const { search, species } = req.query;
  const where = {};
  if (species) where.species = species;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { ownerName: { contains: search } },
      { recordNumber: { contains: search } }
    ];
  }
  const patients = await prisma.patient.findMany({ where, orderBy: { updatedAt: 'desc' } });
  res.json(patients);
});

app.post('/api/patients', authenticate, async (req, res) => {
  // Generate sequence number
  const count = await prisma.patient.count();
  const recordNumber = String(count + 1).padStart(6, '0');
  
  const patient = await prisma.patient.create({
    data: { ...req.body, recordNumber }
  });
  res.json(patient);
});

app.get('/api/patients/:id', authenticate, async (req, res) => {
  const patient = await prisma.patient.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      consultations: { orderBy: { date: 'desc' } },
      vaccinations: true,
      dewormings: true
    }
  });
  if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
  res.json(patient);
});

// --- CONSULTATION ROUTES ---
app.post('/api/consultations', authenticate, async (req, res) => {
  const count = await prisma.consultation.count();
  const number = String(count + 1).padStart(6, '0');
  
  const data = { ...req.body, number, vetId: req.user.id };
  // Expected itemsUsed array in req.body.itemsUsed
  const itemsUsed = data.itemsUsed;
  delete data.itemsUsed;

  const cost = data.cost || 0;
  delete data.cost;

  try {
    const consultation = await prisma.$transaction(async (tx) => {
      const created = await tx.consultation.create({ data });
      
      // Handle inventory deductions
      if (itemsUsed && itemsUsed.length > 0) {
        for (const item of itemsUsed) {
          await tx.inventoryItem.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } }
          });
          await tx.inventoryMovement.create({
            data: {
              itemId: item.id,
              type: 'USO',
              quantity: item.quantity,
              userId: req.user.id,
              consultationId: created.id
            }
          });
        }
      }

      // Add to cash flow
      if (cost > 0) {
        await tx.cashTransaction.create({
          data: {
            description: `Consulta #${created.number} - Paciente ID: ${created.patientId}`,
            amount: Number(cost),
            category: 'Consulta',
            type: 'INGRESO'
          }
        });
      }
      
      return created;
    });

    res.json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INVENTORY ROUTES ---
app.get('/api/inventory', authenticate, async (req, res) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});

app.post('/api/inventory', authenticate, async (req, res) => {
  const item = await prisma.inventoryItem.create({ data: req.body });
  res.json(item);
});

// --- APPOINTMENT ROUTES ---
app.get('/api/appointments', authenticate, async (req, res) => {
  const { start, end } = req.query;
  const where = {};
  if (start && end) {
    where.date = { gte: new Date(start), lte: new Date(end) };
  }
  const appointments = await prisma.appointment.findMany({ where, include: { patient: true } });
  res.json(appointments);
});

app.post('/api/appointments', authenticate, async (req, res) => {
  const appt = await prisma.appointment.create({ data: req.body });
  res.json(appt);
});

app.put('/api/appointments/:id', authenticate, async (req, res) => {
  const appt = await prisma.appointment.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(appt);
});

// --- CASH FLOW ROUTES ---
app.get('/api/cashflow', authenticate, requireAdmin, async (req, res) => {
  const txs = await prisma.cashTransaction.findMany({ orderBy: { date: 'desc' } });
  res.json(txs);
});

app.post('/api/cashflow', authenticate, requireAdmin, async (req, res) => {
  const tx = await prisma.cashTransaction.create({ data: req.body });
  res.json(tx);
});

// --- START SERVER ---
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
server.on('error', (e) => {
  console.error("Server error:", e);
});
