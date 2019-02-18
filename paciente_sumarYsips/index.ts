import { Microservice } from '@andes/bootstrap';
import { Connections } from '@andes/log';
import { logDatabase } from './config.private';
import { conexionPaciente } from './controller/consultas';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();
const PQueue = require('p-queue');
import * as Fhir from '@andes/fhir';

import { getCuie } from './service/operaciones.service';
import { getPaciente } from './service/operaciones.service';
router.group('/paciente', (group) => {
    Connections.initialize(logDatabase.log.host, logDatabase.log.options);
    const queue = new PQueue({ concurrency: 1 });
    group.post('/create', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes');
            let pac: any = await getPaciente(idAndes);
            console.log("entra", pac);
            // let pac = Fhir.Patient.decode(paciente);

            // pac['id'] = idAndes.value;
            // pac['financiador'] = paciente.financiador;
            // pac['efectorCodigo'] = paciente.efectorCodigo;
            // pac['estado'] = paciente.estado;
            // pac['fechaCreacion'] = paciente.fechaCreacion;
            // pac['fechaActualizacion'] = paciente.fechaActualizacion;
            // pac['fechaMuerte'] = paciente.deceasedDateTime;
            // pac['localidad'] = paciente.localidad;conexionPaciente
            // pac['doc'] = paciente.doc;
            // pac['docTutor'] = paciente.relacion;
            // await conexionPaciente(pac);
        }
    });
    group.put('/update', async (_req: any, res) => {
        res.send({ message: 'ok' });
        const paciente = _req.body.data;
        if (paciente) {
            let idAndes = paciente.identifier.find((ids) => ids.assigner === 'andes');
            let pac: any = await getPaciente(idAndes.value);
            //console.log("entra", JSON.stringify(pac.direccion[0].ubicacion.provincia.nombre));
            let prov: any = await getCuie(pac.direccion[0].ubicacion.provincia.nombre);

            console.log("entra", prov);

            // await conexionPaciente(pac);
            // pac['id'] = idAndes.value;
            // pac['financiador'] = paciente.financiador;
            // pac['efectorCodigo'] = paciente.efectorCodigo;
            // pac['estado'] = paciente.estado;
            // pac['fechaCreacion'] = paciente.fechaCreacion;
            // pac['fechaActualizacion'] = paciente.fechaActualizacion;
            // pac['fechaMuerte'] = paciente.deceasedDateTime;
            // pac['localidad'] = paciente.localidad;
            // pac['provincia'] = paciente.provincia;
            // pac['doc'] = paciente.doc;
            // pac['docTutor'] = paciente.relacion;


        }
    });


});

ms.add(router);
ms.start();
