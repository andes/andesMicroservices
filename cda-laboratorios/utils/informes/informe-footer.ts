import { HTMLComponent } from '../model/html-component.class';
import * as moment from 'moment';

export class InformeLabFooter extends HTMLComponent {
    template = `
    <hr>
    <div style="float:left;">
    Estos resultados han sido publicados en la web del Sistema Integral Provincial de Salud de Neuquen.
    </div>
    <div style="float:right;">

    Fecha y hora de impresión: {{fecha}}
    </div>
    `;

    constructor(public organizacion, public user) {
        super();
        this.data = {
            fecha: moment().format("DD/MM/YYYY HH:mm:ss")
        };
    }

}
