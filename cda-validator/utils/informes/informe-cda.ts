import { getAssetsURL, InformeCDAPDF } from "./../model/informeCDA.class";
import { InformeCDABody } from "./informe-body";
import { InformeCDAFooter } from "./informe-footer";
import { InformeCDAHeader } from "./informe-header";

export class InformeCDA extends InformeCDAPDF {
    constructor(private datosGuardia, private paciente, private organizacion) {
        super();
    }

    stylesUrl = [
        getAssetsURL('./utils/sass/main.scss')
    ];

    public async process() {
        this.header = new InformeCDAHeader();
        this.body = new InformeCDABody(this.datosGuardia, this.paciente, this.organizacion);
        this.footer = new InformeCDAFooter();
        await super.process();
    }
}