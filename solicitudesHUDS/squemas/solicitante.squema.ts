import * as mongoose from 'mongoose';

export type ISolicitante = {
    nombre: string;
    apellido: string;
    tipoDocumento: {
        dni: number;
        pasaporte: number;
    };
    email: string;
    telefono: number;
    organismo: {
        nombre: string;
        codigo: number;
        otro: string;
    };
};  

export const SolicitanteSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    tipoDocumento: {
        dni: Number,
        pasaporte: Number
    },
    email: String,
    telefono: Number,
    organismo: {
        nombre: String,
        codigo: Number,
        otro: String,
    }, 
});



export const Solicitante = mongoose.model('solicitantes', SolicitanteSchema);
