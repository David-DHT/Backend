import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// rutas importadas
import categoriaRoutes from './routes/categorias.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import productosRoutes from './routes/productos.routes.js';
import authRoutes from './routes/auth.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import configRoutes from './routes/configuracion.routes.js';

// variables de entorno
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// Middlewares globales (se aplican a TODAS las peticiones)
app.use(cors({
  origin: '*', // Esto permite que cualquier origen (como tu localhost) se conecte
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parsea automáticamente el body JSON que envía el cliente
// Rutas
app.use('/api/categorias', categoriaRoutes); 
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/pago',pagoRoutes);
app.use('/api/config', configRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Ruta categorias: http://localhost:3000/api/categorias');
  console.log('Ruta proveedores: http://localhost:3000/api/proveedores');
  console.log('Ruta usuarios: http://localhost:3000/api/usuarios');
  console.log('Ruta inventario: http://localhost:3000/api/inventario');
  console.log('Ruta de reportes: http://localhost:3000/api/reportes');
  console.log('Ruta productos: http://localhost:3000/api/productos');
});

export default app;