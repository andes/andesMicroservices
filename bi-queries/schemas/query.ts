import * as mongoose from 'mongoose';

export let schema = new mongoose.Schema({
    _id: String,
    nombre: String,
    descripcion: String,
    coleccion: String,
    query: String,
    argumentos: [{
        key: String,
        label: String,
        componente: String,
        param: String,
        tipo: String,
        nombre: String,
        valor: String
    }]
});

export let QuerySchema = mongoose.model('queries', schema, 'queries');
