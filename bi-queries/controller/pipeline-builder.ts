import { IQuery, IParams } from '../schemas/query';
import { Types } from 'mongoose';
import * as moment from 'moment';

export function createPipeline(queryData: IQuery, params: IParams[]) {
    function getValue(arg) {
        const v = params.find(item => item.key === arg.key);
        if (v) {
            if (arg.tipo === 'date') {
                v.valor = moment(v.valor).toDate();
            } else if (Types.ObjectId.isValid(v.valor)) {
                v.valor = new Types.ObjectId(v.valor);
            }
        }
        return v;
    }
    let query = queryData.query;
    if (typeof query === 'string') {
        query = JSON.parse(query);
    }
    let pipeline;
    for (const arg of queryData.argumentos) {
        if (!pipeline) {
            pipeline = queryData.query;
        }

        const valor = getValue(arg);

        if (arg.required && !valor) {
            throw new Error('falta paramentro ' + arg.key);
        }

        pipeline = replaceQuery(pipeline, arg, valor);
    }

    return pipeline;
}


function replaceQuery(pipeline, argumento, valor, innerQuery = false) {
    if (Array.isArray(pipeline)) {
        return pipeline.map(item => replaceQuery(item, argumento, valor, innerQuery));
    } else if (typeof pipeline === 'object') {
        for (const key in pipeline) {
            if (argumento.subquery && key === '#' + argumento.key && !innerQuery) {
                delete pipeline[key];
                if (valor !== undefined && valor !== null) {
                    const q = replaceQuery(argumento.subquery, argumento, valor, true);
                    Object.assign(pipeline, q);
                }
            } else {
                pipeline[key] = replaceQuery(pipeline[key], argumento, valor, innerQuery);
            }
        }

        for (const key in pipeline) {
            if (key.startsWith('!')) {
                const vv = pipeline[key];
                delete pipeline[key];
                const newKey = '$' + key.substring(1);
                pipeline[newKey] = vv;
            }
        }

        return pipeline;

    } else if (typeof pipeline === 'string') {
        if (pipeline === '#' + argumento.key) {
            if (argumento.subquery && !innerQuery) {
                return replaceQuery(argumento.subquery, argumento, valor, true);
            } else {
                return valor.valor;
            }
        } else {
            return pipeline;
        }
    } else {
        return pipeline;
    }
}

export function createProjectStage(fieldText: string) {
    const project = {};
    const fields = fieldText.split(',').map(s => s.trim());
    fields.forEach(field => {
        if (field.startsWith('-')) {
            project[field.substring(1)] = 0;
        } else {
            project[field] = 1;
        }
    });
    return { $project: project };
}

export function createDistinctStage(columnName) {
    const stages = {
        $group: {
            _id: `$${columnName}`,
            [columnName]: { $first: `$${columnName}` }
        }
    };
    return stages;
}


export function createMappingStage(mappings) {
    if (mappings.length === 0) { return []; }
    const lookupStages = [];
    const addFieldStage = {};
    const addFieldStage2 = {};
    const removeFieldStage = {};
    mappings.forEach((map) => {
        const stage = {
            $lookup: {
                from: 'queries_mapping',
                let: { valor: '$' + map.columnName, },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$sourceValue', '$$valor'] },
                            source: map.source,
                            target: map.target
                        }
                    }
                ],
                as: map.columnName + '_map'
            }
        };
        lookupStages.push(stage);
        removeFieldStage[map.columnName + '_map'] = 0;
        addFieldStage[map.columnName] = { $arrayElemAt: [`$${map.columnName}_map`, 0] };
        addFieldStage2[map.columnName] = {
            $ifNull: [`$${map.columnName}.targetValue`, null]
        };
    });

    return [
        ...lookupStages,
        { $addFields: addFieldStage },
        { $addFields: addFieldStage2 },
        { $project: removeFieldStage }
    ];
}
