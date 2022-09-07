import { userScheduler } from '../config.private';
import { msFacturacionLog } from '../logger/msFacturacion';
const log = msFacturacionLog.startTrace();
import { facturaRecupero } from './../facturar/recupero-financiero/factura-recupero';
import { QueryRecupero, getIdTipoNomencladorSIPS, updateRelPacienteObraSocial } from './../facturar/recupero-financiero/query-recupero';
import { IDtoFacturacion } from './../interfaces/IDtoFacturacion';
import { IDtoRecupero } from '../interfaces/IDtoRecupero';

/**
 *
 *
 * @export
 * @param {*} pool
 * @param {IDtoFacturacion} dtoFacturacion
 * @param {*} datosConfiguracionAutomatica
 */
export async function exportarFacturacion(pool, dtoFacturacion: IDtoFacturacion) {
    let dtoRecupero: IDtoRecupero;
    const fechaTurno = dtoFacturacion.turno.fechaTurno;
    if (dtoFacturacion.obraSocial.financiador !== 'SUMAR') {
        /* Paciente tiene OS Se factura por Recupero */
        /* TODO: Verificar si hay precondición para facturar por Recupero*/
        let os = (dtoFacturacion.obraSocial.prepaga) ? dtoFacturacion.obraSocial.idObraSocial : dtoFacturacion.obraSocial.codigoPuco;
        const configAutomatica = dtoFacturacion.configAutomatica;
        if (configAutomatica) {
            let queryRecupero = new QueryRecupero();
            const idPaciente = await queryRecupero.getIdPacienteSips(pool, dtoFacturacion.paciente.documento);

            if (idPaciente) {
                dtoRecupero = {
                    objectId: dtoFacturacion.turno._id,
                    fechaTurno,
                    idTipoNomenclador: configAutomatica.recuperoFinanciero.idTipoNomenclador,
                    codigo: configAutomatica.recuperoFinanciero.codigo,
                    idServicio: configAutomatica.recuperoFinanciero.idServicio,
                    idPaciente,
                    dniProfesional: dtoFacturacion.profesional.documento,
                    codigoFinanciador: os,
                    idEfector: dtoFacturacion.organizacion.idSips,
                    motivoDeConsulta: dtoFacturacion.motivoConsulta,
                    prepaga: dtoFacturacion.obraSocial.prepaga,
                };

                const idObraSocial = await queryRecupero.getIdObraSocialSips(pool, dtoRecupero);

                if (idObraSocial && typeof idObraSocial === 'number') {
                    // si no existe la relacion paciente/obra social, la creamos
                    await updateRelPacienteObraSocial(pool, idPaciente, idObraSocial);
                    //obtenemos el idTipoNomenclador desde SIPS
                    dtoRecupero.idTipoNomenclador = await getIdTipoNomencladorSIPS(idObraSocial, fechaTurno, pool);
                }

                await facturaRecupero(pool, dtoRecupero);
            }
        } else {
            log.error('jsonFacturacion:recupero:sinConfiguracion', { prestacion: dtoFacturacion.prestacion }, 'la prestacion no está configurada', userScheduler);
        }
    }
}
