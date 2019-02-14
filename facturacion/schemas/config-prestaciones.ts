import * as mongoose from 'mongoose';

let datoReportableSchema = new mongoose.Schema({
    idDatosReportables: String,
    valores: [
        {
            conceptId: String,
            valor: String,
            expresion: String
        }
    ]
});

export let configFacturacionAutomaticaSchema = new mongoose.Schema({
    expresionSnomed: { type: String },
    prestacionSnomed: [{ term: String, conceptId: String }],
    recuperoFinanciero: {
        descripcion: { type: String },
        idNomenclador: { type: String },
        codigo: { type: String },
        idServicio: { type: String }
    },
    sumar: {
        descripcion: { type: String },
        codigo: { type: String },
        diagnostico: mongoose.Schema.Types.Mixed,
        datosReportables: [datoReportableSchema],
        idNomenclador: { type: String }
    }
});

export let configFacturacionAutomaticaModel = mongoose.model('configFacturacionAutomatica', configFacturacionAutomaticaSchema, 'configFacturacionAutomatica');

// export = configFacturacionAutomatica;
