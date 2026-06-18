import { Microservice, Middleware } from '@andes/bootstrap';
import { MONGO_HOST } from './config.private';
import { recetaService } from './controllers/RecetaService';
import { recetaInsumoService } from './controllers/RecetaInsumoService';

import * as mongoose from 'mongoose';

process.on('unhandledRejection', (err: any) => {
    console.warn('unhandledRejection:', err?.message || err);
});

mongoose.connect(MONGO_HOST, { useNewUrlParser: true, useUnifiedTopology: true, autoIndex: false });
mongoose.connection.on('error', (err: any) => console.error('Error MongoDB Andes:', err));

mongoose.connection.once('open', () => {
    console.log('MongoDB Andes conectado');

    const pkg = require('./package.json');
    const ms = new Microservice(pkg);
    const router = ms.router();

    function handleError(res: any, err: any) {
        const status = err?.status || 500;
        return res.status(status).json({ message: err?.message || 'Error interno del servidor' });
    }

    router.group('/recetas', (group: any) => {
        group.get('/', Middleware.authenticate(), async (req: any, res: any) => {
            const result = await recetaService.buscar(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });
    });

    router.group('/recetasInsumos', (group: any) => {
        group.get('/', Middleware.authenticate(), async (req: any, res: any) => {
            const result = await recetaInsumoService.buscar(req);
            if (result instanceof Error) return handleError(res, result);
            res.json(result);
        });
    });

    ms.add(router);
    ms.start();
});
