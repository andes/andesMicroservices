import * as mongoose from 'mongoose';

/**
 * Crea una solicitud completa: paciente + solicitante + pedido.
 * Recibe un objeto con { solicitante, paciente, pedido }.
 */
export async function crearSolicitud(data: any) {
    const SolicitudPac = mongoose.model('solicitudPac');
    const Solicitante = mongoose.model('solicitantes');
    const PedidoSolic = mongoose.model('pedidoSolic');

    // 1. Crear el paciente
    const paciente = new SolicitudPac(data.paciente);
    await paciente.save();

    // 2. Crear el solicitante
    const solicitante = new Solicitante(data.solicitante);
    await solicitante.save();

    // 3. Crear el pedido, referenciando al paciente y al solicitante
    const pedidoData = {
        ...data.pedido,
        paciente: paciente._id,
        solicitante: solicitante._id,
    };
    const pedido = new PedidoSolic(pedidoData);
    await pedido.save();

    return {
        pedido,
        paciente,
        solicitante,
    };
}

/**
 * Lista solicitudes (pedidos) con filtros opcionales.
 * Incluye los datos del paciente y del solicitante referenciados.
 */
export async function listarSolicitudes(query: any = {}) {
    const PedidoSolic = mongoose.model('pedidoSolic');
    const solicitudes = await PedidoSolic.find(query).populate('paciente').populate('solicitante');
    return solicitudes;
}

/**
 * Obtiene una solicitud (pedido) por ID.
 * Incluye los datos del paciente y del solicitante referenciados.
 */
export async function obtenerSolicitud(id: string) {
    const PedidoSolic = mongoose.model('pedidoSolic');
    const solicitud = await PedidoSolic.findById(id).populate('paciente').populate('solicitante');
    return solicitud;
}
