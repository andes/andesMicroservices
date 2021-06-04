import { IPerinatal } from '../schemas/perinatal';
import { QueryMapping } from '../schemas/query_mapping';

import { fakeRequest, MONGO_HOST } from '../config.private';
import { log } from '@andes/log';

import * as mongoose from 'mongoose';

mongoose.connect(MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true }).
    then(() => console.log('Conexion Exitosa BD Mongo'))
    .catch(err => {
        log(fakeRequest, 'microservices:integration:sip-plus', MONGO_HOST, 'Mongo Conexión:error', `${err.message}`);
    });


export async function getMatching(tipoMatch = null) {
    const tipo: string = tipoMatch || 'paciente';
    const source = `andes:${tipo}`;
    try {
        const dataMapped = await QueryMapping.find({ source, target: "sip+" });

        return dataMapped.map(elemMap => {

            let sipPlus = {
                code: elemMap['targetValue']['code'],
                type: elemMap['targetValue']['type']
            }
            const key = (tipo.includes('snomed')) ? elemMap['sourceValue']['key'] : elemMap['sourceValue'];

            let dataMap: IPerinatal = { key, sipPlus, tipoMatch };
            // si el tipo de mapeo contiene conceptos Snomed, entonces se obtienen sus datos
            if (tipo.includes('snomed')) {
                dataMap.concepto = elemMap['sourceValue']['concepto'];
                if (elemMap['sourceValue']['valor']) {
                    dataMap.sipPlus.valor = elemMap['targetValue']['valor'];
                }
            }
            return dataMap;
        });

    } catch (error) {
        log(fakeRequest, 'microservices:integration:sip-plus', source, 'getMatching:error', error);
    }
    return [];
}
