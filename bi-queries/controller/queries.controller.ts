import { IQuery, IParams } from '../schemas/query';
import * as mongoose from 'mongoose';
import { applyMapping } from './mapping-stream';
import { createPipeline, createProjectStage, createMappingStage, createDistinctStage } from './pipeline-builder';
import { SQLInsertStream, SQLDeleteStream, SQLCreateTableStream } from './sql-exporter';

const Chain = require('stream-chain');

function keyvalue(data) {
    const result = Object.keys(data).map(key => ({ key, valor: data[key] }));
    return result as any[];
}

interface IMapping {
    columnName: string;
    source: string;
    target: string;
}

export function buildPipeline(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    if (!Array.isArray(params)) {
        params = keyvalue(params);
    }

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

    return pipeline;
}

export function execQueryStream(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = buildPipeline(queryData, params, mapping, fields);

    const stream = collection.aggregate(pipeline);
    // const chain = new Chain(mapping.map(m => mappingStream(m.columnName, m.source, m.target)));

    return stream;
}

export async function execQuery(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = buildPipeline(queryData, params, mapping, fields);
    const datos = await collection.aggregate(pipeline).toArray();

    mapping = [...queryData.mapping, ...mapping];

    for (const map of mapping) {
        await applyMapping(datos, map.columnName, map.source, map.target);
    }

    return datos;
}

export async function execQueryToCollection(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = buildPipeline(queryData, params, mapping, fields);

    pipeline.push({
        $out: queryData.nombre + '_output'
    });

    const datos = await collection.aggregate(pipeline).toArray();

    return datos;
}

export async function execQueryToExport(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = buildPipeline(queryData, params, mapping, fields);

    const stream = collection.aggregate(pipeline);
    const chain = new Chain([
        await SQLInsertStream(queryData)
    ]);

    return stream.pipe(chain);
}

export async function execQueryToDelete(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = buildPipeline(queryData, params, mapping, fields);

    pipeline.push(
        createDistinctStage(queryData.export.deleteColumnKey)
    );

    const stream = collection.aggregate(pipeline);
    const chain = new Chain([
        await SQLDeleteStream(queryData)
    ]);

    return stream.pipe(chain);
}

export async function execQueryToCreateTable(queryData: IQuery, params: IParams[], mapping: IMapping[] = [], fields: string = null) {
    const collection = mongoose.connection.collection(queryData.coleccion);
    const pipeline = buildPipeline(queryData, params, mapping, fields);

    const stream = collection.aggregate(pipeline);
    const chain = new Chain([
        await SQLCreateTableStream()
    ]);

    return stream.pipe(chain);
}
