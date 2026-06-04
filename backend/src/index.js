const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// CORS — en desarrollo permite localhost; en producción solo CORS_ORIGIN
app.use(cors({
  origin: (origin, callback) => {
    // En desarrollo, permitir cualquier localhost
    if (env.NODE_ENV !== 'production' && (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
      callback(null, true);
    } else {
      // Siempre permitir según CORS_ORIGIN
      const allowed = (env.CORS_ORIGIN || '').split(',').map(o => o.trim());
      if (allowed.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('CORS no permitido'));
      }
    }
  },
  credentials: true,
}));

app.use(express.json());

// Rutas
app.use('/api', routes);

// Error handler (siempre al final)
app.use(errorHandler);

// Start
const server = app.listen(env.PORT, () => {
  console.log(`Servidor Mascolandia corriendo en puerto ${env.PORT}`);
  console.log(`Ambiente: ${env.NODE_ENV}`);
});

server.on('error', (e) => {
  console.error('Server error:', e);
});
