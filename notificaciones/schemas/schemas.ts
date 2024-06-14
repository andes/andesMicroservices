import * as mongoose from 'mongoose';
import { Document, Model } from 'mongoose';

export const PrestacionSchema = new mongoose.Schema({
    inicio: String,
    solicitud: {
        turno: mongoose.Schema.Types.ObjectId,
        organizacion: { nombre: String },
        profesional: { nombre: String, apellido: String },
    }
});
export const Prestaciones = mongoose.model('prestacion', PrestacionSchema, 'prestaciones');

export interface IConstante {
    key: string;
    nombre: string;
    source: string;
    type: 'text' | 'number';
}
export interface ConstanteDocument extends IConstante, Document { };
export const ConstanteSchema = new mongoose.Schema({
    key: String,
    nombre: String,
    source: String,
    type: String,
});
export const Constantes: Model<ConstanteDocument> = mongoose.model('constantes', ConstanteSchema, 'constantes');

export const agendaSchema = new mongoose.Schema({
    organizacion: { nombre: String },
    profesionales: [{ nombre: String, apellido: String }],
});
export const Agendas = mongoose.model('agenda', agendaSchema, 'agenda')