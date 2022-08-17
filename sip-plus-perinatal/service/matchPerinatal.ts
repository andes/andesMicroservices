import { IPerinatal } from '../schemas/perinatal';
import { QueryMapping } from '../schemas/query_mapping';
import { fakeRequest, MONGO_HOST } from '../config.private';
import * as mongoose from 'mongoose';
import { msSipPlusPerinatalLog } from '../logger/msSipPlusPerinatal';
const log = msSipPlusPerinatalLog.startTrace();

mongoose.connect(MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true }).
    then(() => console.log('Conexion Exitosa BD Mongo'))
    .catch(err => {
        log.error('Mongo Conexión:error', MONGO_HOST, `${err.message}`, fakeRequest);
    });


export async function getMatching(tipoMatch = null) {
    const tipo: string = tipoMatch || 'paciente';
    const source = `andes:${tipo}`;
    try {
        const dataMapped = await QueryMapping.find({ source, target: "sip+" });

        return dataMapped.map(elemMap => {
            try {
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
                    if (elemMap['targetValue']['extra']) {
                        dataMap.sipPlus.extra = elemMap['targetValue']['extra'];
                    }
                }
                return dataMap;
            } catch (error) {
                log.error('getMatching:error', { dataMapped, source}, error, fakeRequest);
                return null;
            }
        });

    } catch (error) {
        log.error('getMatching:error',source, error, fakeRequest);
    }
    return [];
}
