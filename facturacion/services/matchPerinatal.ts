import { IPerinatal } from './../interfaces/matching';
import { QueryMapping } from './../interfaces/query_mapping';

import { fakeRequest } from '../config.private';
import { log } from '@andes/log';

import * as mongoose from 'mongoose';
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb://localhost:27017/andes';

mongoose.connect(MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true }).
    then(() => console.log('Conexion Exitosa BD Mongo'))
    .catch(err => {
        log(fakeRequest, 'microservices:integration:falturacion', MONGO_HOST, 'Mongo Conexión:error', `${err.message}`);
    });


export async function getMatching(tipoMatch = null) {
    const tipo = tipoMatch || 'facturacion-prenatal';
    const source = `andes:${tipo}`;
    try {
        const dataMapped = await QueryMapping.find({ source, target: "sip+" });

        return dataMapped.map(elemMap => {

            const sipPlus = {
                code: elemMap['targetValue']['code'],
                type: elemMap['targetValue']['type']
            }
            const key = (tipo === 'snomed') ? elemMap['sourceValue']['key'] : elemMap['sourceValue'];

            let dataMap: IPerinatal = { key, sipPlus, tipoMatch };
            if (tipo === 'snomed') { dataMap.concepto = elemMap['sourceValue']['concepto'] }
            return dataMap;
        });

    } catch (error) {
        log(fakeRequest, 'microservices:integration:facturacion', source, 'getMatching:error', error);
    }
    return [];
}
