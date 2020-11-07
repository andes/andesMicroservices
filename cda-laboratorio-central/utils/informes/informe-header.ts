import { HTMLComponent } from '../model/html-component.class';
import { loadImage } from '../model/informe.class';
import { PROVINCIA } from '../../controller/config.private';

export class InformeLabHeader extends HTMLComponent {
    template = `
            <!-- Cabezal logos institucionales -->
            <section class="contenedor-logos">
                <span class="contenedor-logo-efector">
                    {{#if logos.organizacion}}
                        <img class="logo-efector" src="data:image/png;base64,{{ logos.organizacion }}">
                    {{else}}
                        <b class="no-logo-efector">
                            {{{ organizacion.nombre }}}
                        </b>
                    {{/if}}
                </span>
                <span class="contenedor-logos-secundarios">
                    <img class="logo-adicional" src="data:image/png;base64,{{ logos.adicional }}">
                    <img class="logo-andes" src="data:image/png;base64,{{ logos.andes  }}">
                </span>
            </section>
            <section class="contenedor-data-origen">
                <!-- Datos paciente -->
                <span class="contenedor-principal-data">
                    <div class="contenedor-secundario">
                        <h6 class="volanta">Datos del paciente</h6>
                        <h4>
                            {{ paciente.apellido }}, {{ paciente.nombre }}
                        </h4>
                        <h4>
                           {{ paciente.documento }}
                        </h4>
                    </div>
                    <div class="contenedor-secundario">
                    </div>
                </span>

                <!-- Datos origen solicitud -->
                <span class="contenedor-principal-data">
                     <div class="contenedor-secundario">
                         <h6 class="volanta">ORIGEN DE SOLICITUD</h6>
                             <h4>
                                 {{{ origen.efectorOrigen }}}
                             </h4>
                     </div>
                    <div class="contenedor-secundario">
                        <h6 class="volanta">RESULTADO EMITIDO POR:</h6>
                        <h4>
                            {{{ organizacion.nombre }}}
                        </h4>
                    </div>
                </span>
            </section>
    `;

    constructor(public encabezado) {
        super();

        this.data = {
            paciente: {
                nombre: encabezado.pacienteNombre,
                apellido: encabezado.pacienteApellido,
                documento: encabezado.numeroDocumento
            },
            organizacion: { nombre: encabezado.efector },
            origen: { efectorOrigen: encabezado.solicitante },
            logos: {
                adicional: loadImage(`utils/img/logo-adicional-${PROVINCIA}.png`),
                andes: loadImage('utils/img/logo-andes-h.png'),
                organizacion: '' // Sin logo
            }
        };

    }

}
