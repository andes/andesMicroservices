import * as mongoose from 'mongoose';

// Schema mínimo de solo lectura — la colección authApps pertenece al
// dominio de autenticación del monolito. Solo se consulta el campo
// token para verificar que el app-token recibido siga activo.
const authAppSchema = new mongoose.Schema({
    nombre: String,
    token: String
}, { autoIndex: false, strict: false });

export const AuthApp = mongoose.model('authApps', authAppSchema, 'authApps');
