import { IQuery } from '../schemas/query';

const sql = require('mssql');

const defaultConfig = {
    user: 'SA',
    password: '<YourStrong@Passw0rd>',
    server: '127.0.0.1',
    database: 'TestDB',
    connectionTimeout: 10000,
    requestTimeout: 45000
};

export async function SQLInsertStream(queryData: IQuery) {
    const table = queryData.export.table;
    const config = queryData.export.config;

    const pool = await sql.connect(
        { ...defaultConfig, ...config }
    );

    return async function transform(model) {
        await createInstert(pool, table, model);
        return model;
    };
}

export async function SQLDeleteStream(queryData: IQuery) {
    const table = queryData.export.table;
    const config = queryData.export.config;
    const columnName = queryData.export.deleteColumnKey;

    const pool = await sql.connect(
        { ...defaultConfig, ...config }
    );

    return async function transform(model) {
        await createDelete(pool, table, columnName, model[columnName]);
        return model;
    };
}

export async function SQLCreateTableStream() {
    const modelKey = {};

    return async function transform(model) {
        for (const key in model) {
            if (!modelKey[key]) {
                if (!isNaN(parseInt(model[key], 10))) {
                    modelKey[key] = 'int';
                } else {
                    modelKey[key] = 'string';
                }
            }
        }
        return modelKey;
    };
}

function createInstert(pool, table, model) {
    const request = pool.request();
    const cols = [];
    const inputs = [];

    for (let k in model) {
        request.input(k, model[k]);
        cols.push(k);
        inputs.push('@' + k);
    }

    const query = `insert into ${table} (${cols.toString()}) values (${inputs.toString()})`;
    return request.query(query);
}

function createDelete(pool, table, columnName, value) {
    const request = pool.request();
    const query = `DELETE FROM ${table} WHERE ${columnName} ='${value}'`;
    return request.query(query);
}
