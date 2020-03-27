import { IQuery, IParams, Query } from '../schemas/query';
import * as mongoose from 'mongoose';
import { mappingStream, applyMapping } from './mapping-stream';
import { createPipeline, createProjectStage, createMappingStage } from './pipeline-builder';
import { csvTransform } from './csv-stream';

function keyvalue(data) {
    const result = Object.keys(data).map(key => ({ key, valor: data[key] }));
    return result as any[];
}

async function main() {
    const query = await Query.findById('5e7d2fb18fe0e0cde9ed6076');

    const params = {
        paciente: '5d0be4cf8fc55f15d48e16ff'
    };

    const datos = execQueryStream(query, keyvalue(params));

    datos.pipe(csvTransform()).pipe(process.stdout).on('end', process.exit);

}

// main();


interface IMapping {
    columnName: string;
    source: string;
    target: string;
}

export function execQueryStream(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    if (!Array.isArray(params)) {
        params = keyvalue(params);
    }

    const collection = mongoose.connection.collection(queryData.coleccion);
    let pipeline = createPipeline(queryData, params);

    mapping = [...queryData.mapping, ...mapping];

    const mapStages = createMappingStage(mapping);

    pipeline = [
        ...pipeline,
        ...mapStages
    ];

    if (fields) {
        const project = createProjectStage(fields);
        pipeline.push(project);
    }

    const stream = collection.aggregate(pipeline);


    const Chain = require('stream-chain');
    const chain = new Chain(mapping.map(m => mappingStream(m.columnName, m.source, m.target)));

    return stream.pipe(chain);
}

export async function execQuery(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = createPipeline(queryData, params);

    if (fields) {
        const project = createProjectStage(fields);
        pipeline.push(project);
    }

    const datos = await collection.aggregate(pipeline).toArray();

    mapping = [...queryData.mapping, ...mapping];

    for (const map of mapping) {
        await applyMapping(datos, map.columnName, map.source, map.target);
    }

    return datos;
}

export async function execQueryToCollection(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = createPipeline(queryData, params);

    if (fields) {
        const project = createProjectStage(fields);
        pipeline.push(project);
    }

    pipeline.push({
        $out: queryData.nombre + '_output'
    });

    const datos = await collection.aggregate(pipeline).toArray();

    return datos;
}

