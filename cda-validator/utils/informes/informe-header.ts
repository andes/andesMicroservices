import { HTMLComponent } from "../model/html-component.class";
import { loadImage } from "../model/informeCDA.class";

export class InformeCDAHeader extends HTMLComponent {
    template = `
    <div>
    	<img class="logoHeader" src="data:image/png;base64,{{ logo }}">
       	<div class="rectTitulo"><b><p>SERVICIO DE EMERGENCIA - REGISTRO DE GUARDIA</p></b></div>
    	<div class="clearfix"></div>
    </div>    
    `;

    constructor() {
        super();
        this.data = {
            logo: loadImage(`utils/img/logo.png`)
        };
    }
}