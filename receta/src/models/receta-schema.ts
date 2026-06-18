import * as mongoose from 'mongoose';

const SnomedConcept = new mongoose.Schema({
    conceptId: String,
    fsn: String,
    term: String,
    semanticTag: String
}, { _id: false });

const ProfesionalSubSchema = new mongoose.Schema({
    id: String,
    nombre: String,
    apellido: String,
    documento: String,
    profesion: String,
    matricula: Number,
    especialidad: String,
}, { _id: false });

const PacienteSubSchema = new mongoose.Schema({
    id: mongoose.SchemaTypes.ObjectId,
    nombre: String,
    apellido: String,
    documento: String,
    sexo: String,
    fechaNacimiento: Date,
    obraSocial: mongoose.SchemaTypes.Mixed
}, { _id: false });

const organizacionSchema = {
    id: String,
    nombre: String
};

const organizacionConDireccionSchema = {
    id: mongoose.SchemaTypes.ObjectId,
    nombre: String,
    direccion: String
};

const sistemaSchema = {
    type: String,
    enum: ['sifaho', 'recetar']
};

const dosisDiariaSchema = {
    dosis: String,
    intervalo: mongoose.SchemaTypes.Mixed,
    dias: Number,
    notaMedica: String
};

const tipoRecetaSchema = {
    type: String,
    enum: ['duplicado', 'triplicado', 'simple']
};

const appNotificadaSchema = {
    app: sistemaSchema,
    fecha: Date
};

const origenExternoSchema = {
    id: String,
    app: sistemaSchema,
    fecha: Date
};

const estadosSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['pendiente', 'vigente', 'finalizada', 'vencida', 'suspendida', 'rechazada', 'eliminada'],
        default: 'vigente'
    },
    motivo: String,
    observacion: String,
    profesional: ProfesionalSubSchema,
    organizacionExterna: organizacionSchema
}, { autoIndex: false });

const cancelarSchema = new mongoose.Schema({
    idDispensaApp: String,
    motivo: String,
    organizacion: organizacionSchema
}, { autoIndex: false });

const estadoDispensaSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['sin-dispensa', 'dispensada', 'dispensa-parcial'],
        default: 'sin-dispensa'
    },
    idDispensaApp: String,
    fecha: Date,
    sistema: sistemaSchema,
    cancelada: cancelarSchema
}, { autoIndex: false });

const medicamentoSubschema = new mongoose.Schema({
    concepto: SnomedConcept,
    presentacion: String,
    unidades: String,
    cantidad: Number,
    cantEnvases: Number,
    dosisDiaria: dosisDiariaSchema,
    tratamientoProlongado: Boolean,
    tiempoTratamiento: mongoose.SchemaTypes.Mixed,
    ordenTratamiento: Number,
    tipoReceta: tipoRecetaSchema,
    serie: String,
    numero: Number
}, { autoIndex: false });

const codigoSchema = {
    fuente: String,
    valor: String
};

const insumoSubschema = new mongoose.Schema({
    id: String,
    nombre: String,
    codigo: [codigoSchema],
    tipo: {
        type: String,
        enum: ['dispositivo', 'nutricion', 'magistral']
    },
    cantidad: Number,
    unidades: String,
    tratamientoProlongado: Boolean,
    tiempoTratamiento: mongoose.SchemaTypes.Mixed,
    ordenTratamiento: Number,
    especificacion: String
}, { _id: false, autoIndex: false });

export function generarIdDesdeFecha(fecha = new Date()) {
    const pad = (num: number, size: number) => num.toString().padStart(size, '0');
    const id = String(
        fecha.getFullYear().toString() +
        pad(fecha.getMonth() + 1, 2) +
        pad(fecha.getDate(), 2) +
        pad(fecha.getHours(), 2) +
        pad(fecha.getMinutes(), 2) +
        pad(fecha.getSeconds(), 2) +
        pad(fecha.getMilliseconds(), 3) +
        pad(Math.floor(Math.random() * 999), 3)
    );
    return id;
}

// ---- Schema base compartido ----

const baseRecetaSchema = new mongoose.Schema({
    profesional: ProfesionalSubSchema,
    fechaRegistro: Date,
    fechaPrestacion: Date,
    idPrestacion: String,
    idRegistro: String,
    diagnostico: mongoose.SchemaTypes.Mixed,
    dispensa: [{
        idDispensaApp: String,
        fecha: Date,
        organizacion: organizacionSchema,
    }],
    estados: [estadosSchema],
    estadoActual: estadosSchema,
    estadosDispensa: [estadoDispensaSchema],
    estadoDispensaActual: estadoDispensaSchema,
    paciente: PacienteSubSchema,
    renovacion: String,
    appNotificada: [appNotificadaSchema],
    origenExterno: origenExternoSchema
}, { timestamps: true, autoIndex: false });

// Hook pre save compartido
function preSaveHook(next: any) {
    const doc: any = this;
    if (doc.estados && doc.estados.length > 0) {
        doc.estadoActual = doc.estados[doc.estados.length - 1];
    }
    if (doc.estadosDispensa && doc.estadosDispensa.length > 0) {
        doc.estadoDispensaActual = doc.estadosDispensa[doc.estadosDispensa.length - 1];
    }
    next();
}

// ---- Schema receta medicamento ----

export const recetaSchema = baseRecetaSchema.clone();
recetaSchema.add({
    idReceta: String,
    organizacion: organizacionConDireccionSchema,
    medicamento: medicamentoSubschema,
    'dispensa.$*.medicamentos': [{
        cantidad: Number,
        descripcion: String,
        medicamento: mongoose.SchemaTypes.Mixed,
        presentacion: String,
        unidades: String,
        cantidadEnvases: Number,
        observacion: String
    }]
});

recetaSchema.pre('save', preSaveHook);

recetaSchema.post('save', async function (prescription: any) {
    if (!prescription.idReceta) {
        const id = generarIdDesdeFecha(prescription.createdAt);
        await mongoose.model('receta').updateOne({ _id: prescription._id }, { $set: { idReceta: id } });
    }
});

export const Receta = mongoose.model('receta', recetaSchema, 'receta');

export const RecetasParametrosSchema = new mongoose.Schema({
    key: String,
    nombre: String,
    value: String,
    type: String,
    observacion: String
}, { autoIndex: false });
export const RecetasParametros = mongoose.model('recetasParametros', RecetasParametrosSchema, 'recetasParametros');

// ---- Schema receta insumo ----

export const recetaInsumoSchema = baseRecetaSchema.clone();
recetaInsumoSchema.add({
    organizacion: organizacionSchema,
    insumo: insumoSubschema,
    'dispensa.$*.insumos': [{
        cantidad: Number,
        descripcion: String,
        insumo: mongoose.SchemaTypes.Mixed,
        cantidadEnvases: Number,
        observacion: String
    }]
});

recetaInsumoSchema.pre('save', preSaveHook);

export const RecetaInsumo = mongoose.model('recetasInsumo', recetaInsumoSchema, 'recetasInsumo');