import * as mongoose from 'mongoose';

export type IQuery = any;

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
    }]
});

export const Query = mongoose.model('queries', QuerySchema, 'queries');
