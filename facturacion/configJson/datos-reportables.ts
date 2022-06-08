import { validaDatosReportables } from '../facturar/sumar/factura-sumar';
import async = require('async');


export async function drOtoemisiones(dto) {
    let datoReportable = [];
    if ((dto.arrayPrestacion) && (dto.arrayPrestacion.length > 0) && (preCondicionSumar(dto))) {
        let dr = {
            idDatoReportable: '',
            datoReportable: ''
        };

        dto.arrayPrestacion = dto.arrayPrestacion.filter((obj: any) => obj !== null).map((obj: any) => obj);
        dto.arrayConfiguracion = dto.arrayConfiguracion.map((ac: any) => ac[0]);
        let flagDatosReportables = true;

        dto.arrayPrestacion.forEach((element, index) => {
            let oido = dto.arrayConfiguracion.find((obj: any) => obj.conceptId === element.conceptId);

            if (oido) {
                let valor = dto.arrayConfiguracion.find((obj: any) => obj.conceptId === element.valor.conceptId);
                if (valor) {
                    dr.datoReportable += oido.valor + valor.valor + '/';
                } else {
                    flagDatosReportables = false;
                }
            }
        });
        if (flagDatosReportables) {
            dr.idDatoReportable = dto.dtoFacturacion.configAutomatica.sumar.datosReportables[0].idDatosReportables;
            dr.datoReportable = dr.datoReportable.slice(0, -1);

            datoReportable.push(dr);

            return datoReportable;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export async function drNiñoSano(dto) {
    let datoReportable = [];
    if ((dto.arrayPrestacion) && (dto.arrayPrestacion.length > 0) && (preCondicionSumar(dto))) {
        dto.arrayPrestacion = dto.arrayPrestacion.filter((obj: any) => obj !== null).map((obj: any) => obj);

        let ta = '';
        const talla = '2';
        const tensionArterial = '3';

        await async.forEachOf(dto.arrayPrestacion, async (element: any, cb: any) => {
            let dr = {
                idDatoReportable: '',
                datoReportable: ''
            };

            if (element.idDatoReportable === tensionArterial) {
                let taValida = await validaTA(element);
                if (taValida) {
                    if (element.valor.toString().length < 3) {
                        element.valor = 0 + element.valor.toString();

                    }
                    ta += element.valor + '/';

                    dr.idDatoReportable = element.idDatoReportable;
                    dr.datoReportable = ta;
                } else {
                    datoReportable = null;
                }
            } else if (element.idDatoReportable === talla) {
                dr.idDatoReportable = element.idDatoReportable;
                dr.datoReportable = Math.round(element.valor).toString();
            } else {
                dr.idDatoReportable = element.idDatoReportable;
                dr.datoReportable = element.valor;
            }

            if (datoReportable) {
                datoReportable.push(dr);
            }
        });

        if ((datoReportable && datoReportable[2]) && (datoReportable[2].idDatoReportable === tensionArterial)) {
            datoReportable.splice(2, 1);
            datoReportable[2].datoReportable = datoReportable[2].datoReportable.slice(0, -1);
        }

        return datoReportable;
    } else {
        return null;
    }
}

function validaTA(tArterial) {
    let valida = false;
    const tsSistolica = '271649006';
    const taDiastolica = '271650006';
    if ((tArterial.conceptId === tsSistolica) && (tArterial.valor >= 50) && (tArterial.valor <= 300)) {
        valida = true;
    }

    if ((tArterial.conceptId === taDiastolica) && (tArterial.valor >= 40) && (tArterial.valor <= 150)) {
        valida = true;
    }
    return (valida);
}

function preCondicionSumar(dto) {
    let valido = false;
    let esAfiliado = (dto.afiliadoSumar) ? true : false;

    let niñoSano = true; /* Se valida que si la prestación es niño sano se pueda facturar si fue validada por un médico*/
    if ((dto.configAutomatica) && (dto.configAutomatica.sumar.key_datosreportables === 'niño_sano')) {
        if (dto.profesional.formacionGrado !== 'medico') {
            niñoSano = false;
        }
    }

    let datosReportables = (dto.dtoFacturacion.prestacion.datosReportables) ? validaDatosReportables(dto.dtoFacturacion) : true;

    let conditionsArray = [
        esAfiliado,
        niñoSano,
        datosReportables
    ];

    if (conditionsArray.indexOf(false) === -1) {
        valido = true;
    }

    return valido;
}