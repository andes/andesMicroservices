import { Microservice } from '@andes/bootstrap';
import { getAllQueries, descargarCSV } from './controller/queries.controller';
import { mongoDB, logDatabase } from './config.private';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const mongoose = require('mongoose');
import { Connections, log } from '@andes/log';

const router = ms.router();

router.group('/queries', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    mongoose.connect(mongoDB.mongoDB_main.host, { useNewUrlParser: true });
    group.post('/obtenerQueries', async (req, res) => {
        let resQuery: any;
        try {
            let event = req.body.event;
            if (event === 'queries:consultas:getQueries') {
                resQuery = await getAllQueries();
            } else {
                // await log(logDatabase, 'queries:consultas:getQueries', null, ' / Origen query inválido', null);
            }
        } catch (error) {
            // await log(logDatabase, 'queries:consultas:getQueries', null, ' / Origen query inválido', null, error);
        }
        res.json(resQuery);
    });

    group.post('/descargarCsv', async (req, res) => {
        let resQuery: any;
        try {
            let event = req.body.event;
            const data = req.body.data;
            if (event === 'queries:consultas:getCsv') {
                resQuery = await descargarCSV(data);
            } else {
                // await log(logDatabase, 'queries:consultas:getCsv', null, ' / Origen query inválido', null);
            }
        } catch (error) {
            // await log(logDatabase, 'queries:consultas:getCsv', null, ' / Origen query inválido', null, error);
        }
        res.json(resQuery);
    });
});

ms.add(router);
ms.start();
