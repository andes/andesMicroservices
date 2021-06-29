import { HTMLComponent } from '../model/html-component.class';
import * as moment from 'moment';

export class InformeLabBody extends HTMLComponent {
    template = `
        <main>
            <section class="contenedor-informe">
                <article class="cabezal-conceptos horizontal">
                    <div class="contenedor-bloque-texto w-3/4" >
                        <div class="tipo-prestacion">
                            Informe de resultado: {{ titulo }}
                        </div>
                    </div>
                    <div class="contenedor-bloque-texto">
                        <h6 class="bolder">
                            Método empleado
                        </h6>
                        <h6>
                            {{metodo}}
                        </h6>
                    </div>
                    <div class="contenedor-bloque-texto">
                        <h6 class="bolder">
                            Estado
                        </h6>
                        <h6>
                            Validada
                        </h6>
                    </div>
                    <div class="contenedor-bloque-texto">
                        <h6 class="bolder">
                            Fecha Validación
                        </h6>
                        <h6>
                            {{ fecha_validacion }}
                        </h6>
                    </div>
                    <div class="contenedor-bloque-texto">
                        <h6 class="bolder">
                            Profesional Validador
                        </h6>
                        <h6>
                            {{ profesional_firma }}
                        </h6>
                    </div>
                </article>
                <hr>
                <div class="registros">
                    {{resultado}}
                </div>
            </section>
        </main>
    `;

    constructor(public detalle) {
        super();
    }

    public async process() {

        this.data = {
            titulo: 'COVID19',
            esValidada: true,
            resultado: this.detalle.resultado,
            metodo: this.detalle.metodo,
            fecha_validacion: this.detalle.fecha_validacion,
            profesional_firma: this.detalle.profesional_firma

        };
    }


}
