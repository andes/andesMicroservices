import * as mongoose from 'mongoose';

export type ISolicitudPac = {
    nombre: string;
    apellido: string;
    documento: number;
    email: string;
    fechadeNacimiento: Date;
    genero: {
        id: number;
        tipo: string;
    }

};

export const SolicitudPacSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    documento: Number,
    email: String,
    fechadeNacimiento: Date,
    genero: {
        id: Number,
        tipo: String,
    },
});



export const SolicitudPac = mongoose.model('solicitudPac', SolicitudPacSchema);
