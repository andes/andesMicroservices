import { HTMLComponent } from "./../model/html-component.class";
import { loadImage } from "./../model/informeCDA.class";

export class InformeCDAHeader extends HTMLComponent {
    template = `
    <div>
    	<img class="logoHeader" src="data:image/png;base64,{{ logo }}">
    </div>    
    `;

    constructor() {
        super();
        this.data = {
            logo: loadImage(`./utils/img/logo.png`)
        };
    }
}