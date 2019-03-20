import * as sql from 'mssql';
import { Microservice } from '@andes/bootstrap';
import { insertProtocolo, insertProtocoloDetalle, insertDerivacion, getData, getNumeroProtocolo } from './controller/operations';


const PQueue = require('p-queue');
let pkg = require('./package.json');

let ms = new Microservice(pkg);

const router = ms.router();

router.group('/derivacion', (group) => {
    group.post('/ejecutar', async (req, res) => {
        let derivaciones = req.body.data.derivaciones;

        const data: any = getData(req.body.data.idOrganizacionOrigen);
        let transaction = new sql.Transaction( await sql.connect(data.connectionString) );
        let mapeoAndesSips = [];
        try {
            let idProtocolo;
            let idDetalleProtocolo;
            await transaction.begin();

            let numero: any = await getNumeroProtocolo(transaction);
            for (let derivacion of derivaciones) {
                numero++;
                let protocolo = await insertProtocolo(transaction, numero, derivacion, data.idEfector, data.idEfectorDerivacion);
                idProtocolo = ( protocolo ).recordset[0].idProtocolo;
                for (let registro of derivacion.registros) {
                    idDetalleProtocolo = ( await insertProtocoloDetalle(data.idEfector, idProtocolo, registro.valor.codigoPractica, transaction) )
                                            .recordset[0].idDetalleProtocolo;
                    await insertDerivacion(idDetalleProtocolo, transaction);
                }

                mapeoAndesSips.push({
                    numeroSips: numero,
                    idProtocolo: derivacion.idPrestacion,
                    numeroAndes: derivacion.numeroProtocolo,
                });
            }

            await transaction.commit();
        } catch (e) {
            sql.close();
            res.json({ error: 'Error en la integración: ' + e});

        }
        sql.close();
        res.json(mapeoAndesSips);
    });
});

ms.add(router);
ms.start();
