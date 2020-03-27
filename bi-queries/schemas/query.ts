import * as mongoose from 'mongoose';

export type IQuery = {
    key: string;
    nombre: string;
    descripcion: string;
    coleccion: string;
    query: any;
    argumentos: {
        key: string;
        label: string;
        tipo: string;
        required: boolean;
        subquery: any;
    }[];
    mapping: {
        columnName: string;
        source: string;
        target: string;
    }[];
    export?: {
        adapter: string,
        table: string,
        deleteColumnKey: string,
        config: any;
    }
};

export interface IParams {
    key: string;
    valor: any;
}

export const QuerySchema = new mongoose.Schema({
    key: String,
    nombre: String,
    descripcion: String,
    coleccion: String,
    query: mongoose.SchemaTypes.Mixed,
    argumentos: [{
        key: String,
        label: String,
        tipo: String,
        required: Boolean,
        subquery: mongoose.SchemaTypes.Mixed,

        // componente: String,
        // param: String,
        // nombre: String,
        // valor: String

    }],
    mapping: [{
        columnName: String,
        source: String,
        target: String
    }],
    export: {
        adapter: String,
        table: String,
        deleteColumnKey: String,
        config: mongoose.SchemaTypes.Mixed
    }
});

export const Query = mongoose.model('queries', QuerySchema, 'queries');
