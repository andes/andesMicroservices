import { Microservice } from '@andes/bootstrap';
import * as mongoose from 'mongoose';
import { crearSolicitud, listarSolicitudes, obtenerSolicitud } from './controller/solicitudes.controller';
import { enviarEmailConfirmacion, enviarEmailCodigo } from './service/email.service';

require('dotenv').config();

const MONGO_HOST = process.env.MONGO_HOST || 'mongodb://localhost:27017/andes';
mongoose.connect(MONGO_HOST);

// Map en memoria para almacenar códigos de verificación de email (TTL 15 min)
const codigosVerificacion = new Map<string, { code: string; expiresAt: number; verificado: boolean }>();

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
 * POST /verificacion-email
 * Genera y envía un código de verificación al email.
 */
router.post('/verificacion-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Debe ingresar un email válido' });
        }
        const emailNorm = email.trim().toLowerCase();
        const record = codigosVerificacion.get(emailNorm);

        if (record) {
            if (Date.now() > record.expiresAt) {
                codigosVerificacion.delete(emailNorm);
            } else if (record.verificado) {
                console.log(`[VERIFICACION] El email ${emailNorm} ya se encuentra verificado.`);
                return res.json({
                    ok: true,
                    verificado: true,
                    codigoPrueba: record.code,
                    mensaje: 'Email verificado correctamente.'
                });
            } else {
                console.log(`[VERIFICACION] Ya existe un código activo para ${emailNorm}`);
                return res.json({
                    ok: true,
                    reenviado: false,
                    codigoExistente: true,
                    verificado: false,
                    codigoPrueba: record.code,
                    mensaje: 'Ya enviamos un código a este email. Por favor, revisá tu casilla de correo.'
                });
            }
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        codigosVerificacion.set(emailNorm, { code: codigo, expiresAt, verificado: false });
        console.log(`[VERIFICACION] Código generado para ${emailNorm}: ${codigo}`);

        await enviarEmailCodigo(emailNorm, codigo);

        return res.json({ ok: true, verificado: false, mensaje: 'Código enviado exitosamente', codigoPrueba: codigo });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /verificacion-email/validar
 * Valida el código enviado al email.
 */
router.post('/verificacion-email/validar', async (req, res) => {
    try {
        const { email, codigo } = req.body;
        if (!email || !codigo) {
            return res.status(400).json({ error: 'Email y código son requeridos' });
        }
        const emailNorm = email.trim().toLowerCase();
        const record = codigosVerificacion.get(emailNorm);

        if (!record) {
            return res.status(400).json({ error: 'No se encontró un código para este email. Solicitá uno nuevo.' });
        }

        if (Date.now() > record.expiresAt) {
            codigosVerificacion.delete(emailNorm);
            return res.status(400).json({ error: 'El código ha expirado. Solicitá uno nuevo.' });
        }

        if (record.verificado) {
            return res.json({ ok: true, verificado: true, mensaje: 'Email ya verificado correctamente.' });
        }

        if (record.code !== String(codigo).trim()) {
            return res.status(400).json({ error: 'El código ingresado es incorrecto.' });
        }

        record.verificado = true;
        return res.json({ ok: true, verificado: true, mensaje: 'Email verificado correctamente' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * GET /verificacion-email/estado
 * Consulta el estado de verificación de un email.
 */
router.get('/verificacion-email/estado', (req, res) => {
    try {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Debe ingresar un email válido' });
        }
        const emailNorm = email.trim().toLowerCase();
        const record = codigosVerificacion.get(emailNorm);

        if (record && Date.now() <= record.expiresAt && record.verificado) {
            return res.json({ verificado: true });
        }
        return res.json({ verificado: false });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
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
