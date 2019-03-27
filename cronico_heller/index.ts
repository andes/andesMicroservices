import { Microservice } from '@andes/bootstrap';
import { CronicoPaciente } from './controller/cronico';
import * as ConfigPrivate from './config.private';
let pkg = require('./package.json');
let ms = new Microservice(pkg);
const router = ms.router();


let fakeRequest = {
    user: {
        usuario: 'msHeller',
        app: 'integracion-heller',
        organizacion: 'sss'
    },
    ip: ConfigPrivate.staticConfiguration.heller.ip,
    connection: {
        localAddress: ''
    }
};

router.group('/paciente', (group) => {

    group.post('/cronico', async (_req: any, res) => {
       
        const prestacion = _req.body.data;
        
        //console.log(JSON.stringify(prestacion));
        
        if (prestacion) {
            let lstEstado=prestacion.estados;
            for (const estado of lstEstado) {
                                
                if(estado.tipo==='validada')
                  {
                   // console.log("esta validada");                   
                   let lstRegistros=prestacion.ejecucion.registros;
                    for (const registro of lstRegistros) {
                   
                        if(registro.concepto.conceptId==='4471000013103') 
                        // REEEMPLAZAR POR el concepto Snomed de cronico 
                        {
                            let documentPaciente=prestacion.paciente.documento;

                            console.log(documentPaciente);// hasta aca da bien
                            await CronicoPaciente(documentPaciente);

                        }
                    }
                   

                  }
            }
        }
    });

});

ms.add(router);
ms.start();
