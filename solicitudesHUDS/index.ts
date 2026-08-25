import { Microservice } from '@andes/bootstrap';
import * as mongoose from 'mongoose';
import { crearSolicitud, listarSolicitudes, obtenerSolicitud } from './controller/solicitudes.controller';
import { enviarEmailConfirmacion } from './service/email.service';

const MONGO_HOST = process.env.MONGO_HOST || 'mongodb://localhost:27017/andes';
mongoose.connect(MONGO_HOST);

// Registrar los schemas de Mongoose
require('./squemas/solicitante.squema');
require('./squemas/solicitudPac.squema');
require('./squemas/pedidoSolic.squema');

const pkg = require('./package.json');
process.env.PORT = process.env.PORT || '3005';
const ms = new Microservice(pkg);

const router = ms.router();

// Habilitar CORS para permitir peticiones desde el frontend Angular
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

/**
 * POST /solicitudes
 * Crea una solicitud completa con datos del solicitante, paciente y pedido.
 * Body esperado:
 * {
 *   solicitante: { nombre, apellido, tipoDocumento: { dni, pasaporte }, email, telefono, organismo: { nombre, codigo, otro } },
 *   paciente: { nombre, apellido, documento, email, fechadeNacimiento, genero: { id, tipo } },
 *   pedido: { institucion: { id, nombre }, descripcion, efector: { id, nombre }, efectorParticular, adjuntos: [...] }
 * }
 */
router.post('/solicitudes', async (req, res, next) => {
    try {
        const resultado = await crearSolicitud(req.body);
        try {
            const email = await enviarEmailConfirmacion(resultado.solicitante.toObject() as any, resultado.pedido._id.toString());
            return res.status(201).json({ ...resultado, emailEnviado: email.enviado });
        } catch (emailError) {
            // La solicitud ya fue persistida: informar el fallo evita reintentos que la dupliquen.
            console.error('No se pudo enviar el email de confirmación:', emailError.message);
            return res.status(201).json({ ...resultado, emailEnviado: false });
        }
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

/**
 * GET /solicitudes
 * Lista todas las solicitudes. Soporta query params para filtrar.
 */
router.get('/solicitudes', async (req, res, next) => {
    try {
        const solicitudes = await listarSolicitudes(req.query);
        return res.json(solicitudes);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

/**
 * GET /solicitudes/:id
 * Obtiene una solicitud por su ID.
 */
router.get('/solicitudes/:id', async (req, res, next) => {
    try {
        const solicitud = await obtenerSolicitud(req.params.id);
        if (!solicitud) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        return res.json(solicitud);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

ms.add(router);
ms.start();
