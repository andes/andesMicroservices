import { Microservice } from '@andes/bootstrap';
let pkg = require('./package.json');
let ms = new Microservice(pkg);

import { logDatabase, fakeRequestSql } from './config.private';
import { Connections, log } from '@andes/log';

const router = ms.router();

router.group('/queries', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    console.log("Entra a CSV desde Api");
    group.post('/descargarCsv', async (req, res) => {
        try {
            console.log("Entra a descargarrrrr CSV desde APIIIIIII");
            const event = req.body.event;
            const data = req.body.data;

            switch (event) {
                case 'queries:consultas:getQueries': console.log("Get QUeriessss");
                    break;
                default:
                    await log(fakeRequestSql, 'microservices:queries:getQueries', null, '/Origen query inválido', null);
                    break;
            }
        } catch (error) {

        }
    });
});

ms.add(router);
ms.start();
