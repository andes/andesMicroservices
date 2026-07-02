import { Microservice, Middleware } from '@andes/bootstrap';
import { MONGO_HOST } from './config.private';
import { recetaService } from './controllers/RecetaService';
import { recetaInsumoService } from './controllers/RecetaInsumoService';
import { AuthApp } from './models/auth-app.schema';
const rateLimit = require('express-rate-limit');

import * as mongoose from 'mongoose';

process.on('unhandledRejection', (err: any) => {
    console.warn('unhandledRejection:', err?.message || err);
});

mongoose.connect(MONGO_HOST, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: false });
mongoose.connection.on('error', (err: any) => console.error('Error MongoDB Andes:', err));

async function appTokenProtected(req: any, res: any, next: any) {
    if (req.user?.type !== 'app-token') return next();

    try {
        const app: any = await AuthApp.findOne({ _id: req.user.app?.id });
        const rawToken = req.headers?.authorization?.substring(4) || req.query?.token;

        if (app && app.token && app.token === rawToken) {
            return next();
        }
        return res.status(403).json({ message: 'Token de aplicación inválido o revocado' });
    } catch (err) {
        return res.status(403).json({ message: 'Token de aplicación inválido o revocado' });
    }
}

const recetasRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) => req.user?.id || req.user?.app?.id || req.ip,
    message: { message: 'Demasiadas solicitudes, intente nuevamente en un momento' }
});

mongoose.connection.once('open', () => {
    console.log('MongoDB Andes conectado');

    const pkg = require('./package.json');
    const ms = new Microservice(pkg);
    const router = ms.router();

    function handleError(res: any, err: any) {
        const status = err?.status || 500;
        return res.status(status).json({ message: err?.message || 'Error interno del servidor' });
    }

    const auth = [Middleware.authenticate(), recetasRateLimiter, appTokenProtected];

    // GET /modules/recetas — búsqueda por paciente (documento+sexo o pacienteId)
    router.group('/modules/recetas', (group: any) => {
        group.get('/', ...auth, async (req: any, res: any) => {
            const result = await recetaService.buscar(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });

        // GET /modules/recetas/filtros — búsqueda con filtros de fecha y estado
        group.get('/filtros', ...auth, async (req: any, res: any) => {
            const result = await recetaService.buscar(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });

        // GET /modules/recetas/verificar — verifica si existe receta vigente por documento+conceptId+sexo
        group.get('/verificar', ...auth, async (req: any, res: any) => {
            const result = await recetaService.verificarRecetaExistente(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });

        // GET /modules/recetas/profesional/:id
        group.get('/profesional/:id', ...auth, async (req: any, res: any) => {
            const result = await recetaService.buscarPorProfesional(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });
    });

    // GET /modules/recetasInsumos
    router.group('/modules/recetasInsumos', (group: any) => {
        group.get('/', ...auth, async (req: any, res: any) => {
            const result = await recetaInsumoService.buscar(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });
    });

    // GET /fetch_receipt_status — compatibilidad con recetar
    router.get('/fetch_receipt_status', ...auth, async (req: any, res: any) => {
        const result = await recetaService.fetchReceiptStatus(req);
        if (result instanceof Error) return handleError(res, result);
        res.json(result);
    });

    ms.add(router);
    ms.start();
});