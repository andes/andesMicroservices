import * as mongoose from 'mongoose';

// let schema = new mongoose.Schema({
//     nomencladorRecuperoFinanciero: String,
//     snomed: [{ term: String, conceptId: String }],
//     idServicio: String,
//     nomencladorSUMAR: {
//         diagnostico: [{ diagnostico: String, predomina: Boolean }],
//         datosReportables: [
//             {
//                 idDatosReportables: Number,
//                 valores: [
//                     {
//                         conceptId: String,
//                         expresion: String
//                     }
//                 ]
//             }
//         ],
//         codigo: String,
//         id: String
//     }
// });

// let model = mongoose.model('configFacturacionAutomatica', schema, 'configFacturacionAutomatica');
// export = model;

// import * as mongoose from 'mongoose';

let configFacturacionAutomaticaSchema = new mongoose.Schema({
    expresionSnomed: { type: String },
    snomed: [{ term: String, conceptId: String }],
    // prestacionSnomed: {
    //     conceptId: { type: String },
    //     term: { type: String },
    //     fsn: { type: String },
    //     semanticTag: { type: String }
    // },
    recuperoFinanciero: {
        descripcion: { type: String },
        idNomenclador: { type: String },
        codigo: { type: String },
        idServicio: { type: String }
    },
    // nomencladorSUMAR: {
    //     diagnostico: [{ conceptId: String, diagnostico: String, predomina: Boolean }],
    //     datosReportables: [{ idDatosReportables: String, valores: [{ conceptId: String, valor: String, expresion: String }] }],
    //     codigo: String,
    //     id: String
    // }
    sumar: {
        descripcion: { type: String },
        codigo: { type: String },
        // idDatosReportables: { type: String },
        diagnostico: mongoose.Schema.Types.Mixed,
        datosReportables: [{ idDatosReportables: String, valores: [{ conceptId: String, valor: String, expresion: String }] }],
        // datosReportables: mongoose.Schema.Types.Mixed,
        idNomenclador: { type: String }
    }
});

let configFacturacionAutomatica = mongoose.model('configFacturacionAutomatica', configFacturacionAutomaticaSchema, 'configFacturacionAutomatica');

export = configFacturacionAutomatica;
