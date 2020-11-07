import { HTMLComponent } from '../model/html-component.class';
import { loadImage } from '../model/informe.class';
import * as moment from 'moment';

export class InformeLabFooter extends HTMLComponent {
    template = `
        <!-- Firmas -->
        <span class="contenedor-firmas"></span>
        <hr>
        <span class="contenedor-zocalo">
            <img class="logo-pdp" src="data:image/png;base64,{{ logos.pdp }}">
            <article class="contenedor-data-pdp">
                <h6>Nota: El contenido de este informe ha sido validado digitalmente siguiendo los estándares de
                    calidad y seguridad
                    requeridos. El ministerio de salud de la provincia de Neuquén es responsable inscripto en el
                    Registro
                    Nacional de Protección de Datos Personales, según lo requiere la Ley N° 25.326 (art. 3° y 21 inciso
                    1).</h6>
            </article>
            <article class="contenedor-data-organizacion">
                <h6>
                    {{{ organizacion.nombre }}}
                </h6>
            </article>
            <article class="contenedor-data-validacion">
                    <h6 class="bolder">Emitido por:</h6>
                    <h6>
                        {{ validacion.usuario }}
                    </h6>
            </article>
            <hr>
            <span class="numeracion">
                {{{ numeracionHTML }}}
            </span>
        </span>
    `;

    constructor(public organizacion, public user) {
        super();
        this.data = {
            usuario: user,
            organizacion: {
                nombre: organizacion
            },
            hora: moment().format('DD/MM/YYYY HH:mm'),
            logos: {
                pdp: loadImage('utils/img/logo-pdp.png'),
            },
            numeracionHTML: '<small> {{page}} </small> de <small> {{pages}} </small>'
        };
    }

}
