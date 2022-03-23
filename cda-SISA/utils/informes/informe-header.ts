import { HTMLComponent } from '../model/html-component.class';
import { loadImage } from '../model/informe.class';
import { PROVINCIA } from '../../config.private';

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
                        <span style='font-size:0.5rem'>
                            {{ paciente.apellido }}, {{ paciente.nombre }}
                            <br/>
                           {{ paciente.documento }}
                        </span>
                    </div>
                    <div class="contenedor-secundario">
                    </div>
                </span>

                <!-- Datos origen solicitud -->
                <span class="contenedor-principal-data">
                     <div class="contenedor-secundario">
                         <h6 class="volanta">ORIGEN DE SOLICITUD</h6>
                            <span style='font-size:0.5rem'>
                                {{{ emisor }}}
                            </span>
                    </div>
                    <div class="contenedor-secundario">
                        <h6 class="volanta">RESULTADO EMITIDO POR:</h6>
                        <span style='font-size:0.5rem'>
                            {{{ validador }}}
                        </span>
                    </div>
                </span>
            </section>
    `;

    constructor(public encabezado) {
        super();
        this.data = {
            paciente: encabezado.paciente,
            organizacion: encabezado.organizacion,
            emisor: encabezado.emisor,
            validador: encabezado.validador,
            logos: {
                adicional: loadImage(`utils/img/logo-adicional-${PROVINCIA}.png`),
                andes: loadImage('utils/img/logo-andes-h.png'),
                organizacion: '' // Sin logo
            }
        };

    }

}
