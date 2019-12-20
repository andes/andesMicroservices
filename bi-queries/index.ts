import { Microservice } from '@andes/bootstrap';
import { getAllQueries, descargarCSV } from './controller/queries.controller';
import { mongoDB } from './config.private';

let pkg = require('./package.json');
let ms = new Microservice(pkg);
const mongoose = require('mongoose');

import { logDatabase } from './config.private';
import { Connections, log } from '@andes/log';

const router = ms.router();

router.group('/queries', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    mongoose.connect(mongoDB.mongoDB_main.host, { useNewUrlParser: true });
    console.log("Entra a CSV desde Api");
    group.post('/descargarCsv', async (req, res) => {
        let resQuery: any;
        try {
            console.log("Entra a descargarrrrr CSV desde APIIIIIII");
            let event = req.body.event;
            const data = req.body.data;
            switch (event) {
                case 'queries:consultas:getQueries':
                    resQuery = await getAllQueries();
                    break;
                case 'queries:consultas:obtenerCsv':
                    resQuery = await descargarCSV(data);
                    break;
                default:
                    console.log("Error");
                    //await log(fakeRequestSql, 'queries:consultas:getQueries', null, ' / Origen query inválido', null);
                    break;
            }
        } catch (error) {
            console.log("Error Catch: ", error);
            //await  log(fakeRequestSql, 'queries:consultas:getQueries', null, ' / Origen query inválido', null, error);
        }
        console.log("resQuery: ", resQuery);
        res.json(JSON.stringify(resQuery));
    });
});

ms.add(router);
ms.start();
