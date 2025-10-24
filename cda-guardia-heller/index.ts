import { Microservice } from '@andes/bootstrap';
import { crearGuardia } from './controller/ejecutaCDA';
import { userScheduler, organizacion, tipoPrestacion, tokenCDA, tokenHeller } from './config.private';
import { msCDAGuardiaHellerLog } from './logger/msCDAGuardiaHeller';
import { getGuardiasHeller, pdfToBase64 } from './controller/verificaCDA';
import axios from "axios";

let pkg = require('./package.json');
let ms = new Microservice(pkg);

const router = ms.router();
const efector = "heller";
const logGuardia = msCDAGuardiaHellerLog.startTrace();

router.group('/cda', (group) => {
    group.post('/guardia', async (req: any, res) => {
        let verif;
        try {
            const paciente = req.body.data;
            const respGet = await getGuardiasHeller(paciente, tokenHeller);
            for (const resp of respGet) {
                const url = resp.data.file;
                try {
                    if (await axios.head(url)) {
                        const response = await axios.get(url, { responseType: "arraybuffer" });
                        const fileBase64 = Buffer.from(response.data).toString("base64");
                        const profesional = resp.data.profesional;
                        const data = {
                            idGuardia: resp.data.idGuardia,
                            fechaIngreso: resp.data.fechaIngreso,
                            cie10: resp.data.cie10,
                            paciente,
                            profesional: {
                                nombre: profesional.nombre,
                                apellido: profesional.apellido,
                                documento: profesional.documento
                            },
                            organizacion: organizacion,
                            tipoPrestacion,
                            file: `data:application/pdf;base64,${fileBase64}`
                        }
                        verif = await crearGuardia(efector, paciente, data, tokenCDA);
                    }
                } catch (error) {
                    logGuardia.error('guardia:index', resp, error.message, userScheduler);
                }
            }
            if (verif.verif) {
                res.status(200).json({ mensage: verif.msgError, cda: verif.data });
            } else {
                res.status(400).json(verif);
            }
        } catch (error) {
            const msgError = error.message ? error.message : error
            logGuardia.error('guardia:index', { error }, msgError, userScheduler);
            res.status(500).json({ error: msgError });
        }
    });

});

ms.add(router);
ms.start();
