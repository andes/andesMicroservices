import { Schema, SchemaTypes, model } from 'mongoose';

const MappingSchema = new Schema({
    param: String,
    type: String,
    value: {
        type: SchemaTypes.Mixed,
        required: false
    },
    queryOrigin: {
        type: String,
        required: false
    },
    nombreOrigin: {
        type: String,
        required: false
    },
    nombreVisual: {
        type: String,
        required: false
    }
});

export const QueryGuardiaSchema = new Schema({
    nombre: String,
    query: String,
    principal:
    {
        type: Boolean,
        required: false
    },
    mapping: [MappingSchema]
});

export const QueryGuardia = model('guardiaConfig', QueryGuardiaSchema, 'guardiaConfig');

export interface IConnection {
    user: any;
    password: any;
    server: any;
    database: any;
    formatDate: String;
    requestTimeout: Number;

}

export interface IMapping {
    param: String;
    type: String;
    value?: any;
    queryOrigin?: String; // query contiene value
    nombreOrigin?: String; // atributo en queryOrigin que contiene value
    nombreVisual?: String; // nombre a mostrar en el CDA
}

export interface IQueryGuardia {
    connection?: IConnection;
    nombre: string;
    query: string;
    principal?: boolean;
    mapping?: IMapping[]; // datos a mapear en la query
    organizacion: string[],
    result?: any;
}