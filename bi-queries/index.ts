import { Microservice } from '@andes/bootstrap';
import * as mongoose from 'mongoose';
import { execQueryStream, execQueryToExport, execQueryToDelete, buildPipeline, execQueryToCreateTable, execQuery } from './controller/queries.controller';
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
    const activas = { 'inactiva.estado': { $ne: true } };
    const query = {...req.query, ...activas};
    const queries = await Query.find(query);
    return res.json(queries);
});


router.get('/queries/:id', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries = await Query.findById(req.params.id);
    return res.json(queries);
});
router.get('/queries/:id/plain', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.query;
    const fields = req.query.fields;
    delete req.query.fields;
    // const mapping = req.body.mapping || [];
    try {
        const stream = execQueryStream(queries, params, [], fields);
        stream.pipe(csvTransform()).pipe(res);
        stream.on('error', (e) => {
            res.status(400).json({ e });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
// Retorna los resultados de la consulta en formato json
router.get('/queries/:id/json', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.query;
    const fields = req.query.fields;
    delete req.query.fields;
    try {
        const stream = await execQuery(queries, params, [], fields);
        res.json(stream);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
router.get('/queries/:id/create-table', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.query;
    const fields = req.query.fields;
    delete req.query.fields;
    try {
        const stream = await execQueryToCreateTable(queries, params, [], fields);
        let modelKey = {};
        stream.on('data', (data) => modelKey = data);
        stream.on('end', () => {
            let createText = `CREATE TABLE ${queries.export.table} (`;
            for (const key in modelKey) {
                createText += key + ' ' + (modelKey[key] === 'int' ? 'INT' : 'NVARCHAR(200)') + ',';
            }
            createText = createText.substring(0, createText.length - 1);
            createText += ');';
            res.json({ model: modelKey, create: createText });
        });
        stream.on('error', (e) => {
            res.status(400).json({ e });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
router.get('/queries/:id/pipeline', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.query;
    const fields = req.query.fields;
    delete req.query.fields;
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
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.query;
    const fields = req.query.fields;
    delete req.query.fields;
    try {
        const stream = execQueryStream(queries, params, [], fields);
        res.set('Content-Type', 'text/csv');
        res.setHeader('Content-disposition', `attachment; filename=${queries.nombre}.csv`);
        stream.pipe(csvTransform()).pipe(res);
        stream.on('error', (e) => {
            res.status(400).json({ e });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
router.post('/queries/:id/csv', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.body.params;
    const mapping = req.body.mapping || [];
    const fields = req.body.fields;
    try {
        const stream = execQueryStream(queries, params, mapping, fields);
        res.set('Content-Type', 'text/csv');
        res.setHeader('Content-disposition', `attachment; filename=${queries.nombre}.csv`);
        stream.pipe(csvTransform()).pipe(res);
        stream.on('error', (e) => {
            res.status(400).json({ e });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});
router.post('/queries/:id/export', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.body.params;
    const mapping = req.body.mapping || [];
    const fields = req.body.fields;
    try {
        const stream = await execQueryToExport(queries, params, mapping, fields);
        stream.on('data', () => { });
        stream.on('end', () => {
            res.json({ status: 'OK' });
        });
        stream.on('error', (e) => {
            res.status(400).json({ e });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/queries/:id/delete', async (req, res, next) => {
    const Query = mongoose.model('queries');
    const queries: any = await Query.findOne({ nombre: req.params.id });
    const params = req.body.params;
    const mapping = req.body.mapping || [];
    const fields = req.body.fields;

    try {
        const stream = await execQueryToDelete(queries, params, mapping, fields);
        stream.on('data', () => { });
        stream.on('end', () => {
            res.json({ status: 'OK' });
        });
        stream.on('error', (e) => {
            res.status(400).json({ e });
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.patch('/queries/:id', async (req, res, next) => {
    console.log(req.body);
    try {
        const Query = mongoose.model('queries');
        const id = req.params.id;
        const data = req.body;

        const query = await Query.findByIdAndUpdate(id, {
            $set: {
                ...(data.nombre && { nombre: data.nombre }),
                ...(data.descripcion && { descripcion: data.descripcion }),
                ...(data['inactiva.estado'] !== undefined && { 'inactiva.estado': data['inactiva.estado'] }),
                ...(data.desdeAndes !== undefined && { desdeAndes: data.desdeAndes })
            }
        }, { new: true });

        if (!query) {
            return res.status(404).json({ message: 'Query no encontrada' });
        }

        return res.json(query);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
});


ms.add(router);
ms.start();