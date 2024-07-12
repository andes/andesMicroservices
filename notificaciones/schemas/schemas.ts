import { Schema, Model, model, Document } from 'mongoose';

export const PrestacionSchema = new Schema({
    inicio: String,
    solicitud: {
        turno: Schema.Types.ObjectId,
        organizacion: { nombre: String },
        profesional: { nombre: String, apellido: String },
    }
});
export const Prestaciones = model('prestacion', PrestacionSchema, 'prestaciones');

export interface IConstante extends Document {
    key: String;
    nombre: String;
    source: String;
    type: 'text' | 'number';
}
export const ConstanteSchema = new Schema({
    key: String,
    nombre: String,
    source: String,
    type: String,
});
export const Constantes: Model<IConstante> = model<IConstante>('constantes', ConstanteSchema, 'constantes');

export const agendaSchema = new Schema({
    organizacion: { nombre: String },
    profesionales: [{ nombre: String, apellido: String }],
    espacioFisico: {
        nombre: String,
        detalle: String,
        descripcion: String
    }
});
export const Agendas = model('agenda', agendaSchema, 'agenda')