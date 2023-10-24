import moment = require("moment");
import { HTMLComponent } from "../model/html-component.class";

export class InformeCDAFooter extends HTMLComponent {

    template = `
        <hr>
        <div class="foot">
		    Generado el día: {{fecha}}
	    </div>
    `;
    constructor() {
        super();
        this.data = {
            fecha: moment().format("DD/MM/YYYY HH:mm:ss")
        };
    }
}