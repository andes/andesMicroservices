import { ANDES_HOST, ANDES_KEY } from './../config.private';
const request = require('request');

export async function getProfesional(idProfesional) {
    return new Promise((resolve, reject) => {
        const url = `${ANDES_HOST}/core/tm/profesionales?id=${idProfesional}&token=${ANDES_KEY}`;
        request(url, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const prof: any[] = JSON.parse(body);
                const profesional: any = {};
                if (prof && prof.length) {
                    resolve({
                        profesional: {
                            nombre: prof[0].nombre,
                            apellido: prof[0].apellido,
                            dni: prof[0].documento,
                            formacionGrado: prof[0].formacionGrado
                        }
                    });
                }
            }
            reject('No se encuentra profesional: ' + body);
        });
    });
}
