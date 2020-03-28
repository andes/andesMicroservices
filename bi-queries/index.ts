import { Microservice } from '@andes/bootstrap';
import * as mongoose from 'mongoose';
import { execQueryStream, execQueryToExport, execQueryToDelete, execQuery, buildPipeline } from './controller/queries.controller';
import { csvTransform } from './controller/csv-stream';


const MONGO_HOST = process.env.MONGO_HOST || 'mongodb://localhost:27017/andes';
mongoose.connect(MONGO_HOST);

require('./schemas/query');
require('./schemas/query_mapping');

const pkg = require('./package.json');
const ms = new Microservice(pkg);

const router = ms.router();

router.get('/queries', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries = await Query.find();
    return res.json(queries);
});

router.get('/queries/:id', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries = await Query.findById(req.params.id);
    return res.json(queries);
});

router.get('/queries/:id/plain', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findById(req.params.id);
    const params = req.query;
    const fields = req.query.fields;
    delete req.query['fields'];
    // const mapping = req.body.mapping || [];

    try {
        const stream = execQueryStream(queries, params, [], fields);
        stream.pipe(csvTransform()).pipe(res);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }

});

router.get('/queries/:id/pipeline', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findById(req.params.id);
    const params = req.query;
    const fields = req.query.fields;
    delete req.query['fields'];
    // const mapping = req.body.mapping || [];
    try {
        const pipeline = buildPipeline(queries, params, [], fields);
        res.json(pipeline);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get('/queries/:id/csv', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findById(req.params.id);
    const params = req.query;
    const fields = req.query.fields;
    delete req.query['fields'];

    try {
        const stream = execQueryStream(queries, params, [], fields);
        res.set('Content-Type', 'text/csv');
        res.setHeader(`Content-disposition`, `attachment; filename=${queries.nombre}.csv`);
        stream.pipe(csvTransform()).pipe(res);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }

});

router.post('/queries/:id/csv', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findById(req.params.id);
    const params = req.body.params;
    const mapping = req.body.mapping || [];
    const fields = req.body.fields;

    try {
        const stream = execQueryStream(queries, params, mapping, fields);
        res.set('Content-Type', 'text/csv');
        res.setHeader(`Content-disposition`, `attachment; filename=${queries.nombre}.csv`);
        stream.pipe(csvTransform()).pipe(res);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }

});


router.post('/queries/:id/export', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findById(req.params.id);
    const params = req.body.params;
    const mapping = req.body.mapping || [];
    const fields = req.body.fields;

    try {
        const stream = await execQueryToExport(queries, params, mapping, fields);

        stream.on('data', () => { });
        stream.on('end', () => {
            res.json({ status: 'OK' });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/queries/:id/delete', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findById(req.params.id);
    const params = req.body.params;
    const mapping = req.body.mapping || [];
    const fields = req.body.fields;

    try {
        const stream = await execQueryToDelete(queries, params, mapping, fields);
        stream.on('data', () => { });
        stream.on('end', () => {
            res.json({ status: 'OK' });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }

});

ms.add(router);
ms.start();

