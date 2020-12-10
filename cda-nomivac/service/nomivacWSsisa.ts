import { sisaDev } from '../config.private';
const fetch = require('node-fetch');

export async function sisaVacunas(paciente: any) {
    const sexoPaciente = paciente.sexo === 'masculino' ? 'M' : 'F';
    const url = sisaDev.url;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            username: sisaDev.username,
            password: sisaDev.password,
            idTipoDoc: '1',
            nroDoc: paciente.documento,
            sexo: sexoPaciente
        })
    };
    try {
        let response = await fetch(url, options);
        if (response.status === 200) {
            const respJSON = await response.json();
            const { resultado } = respJSON;
            if (resultado === 'OK') {
                return respJSON.aplicacionesVacunasCiudadano.aplicacionVacunaCiudadano;
            }
        }
    } catch (error) {
    }
    return [];
}
