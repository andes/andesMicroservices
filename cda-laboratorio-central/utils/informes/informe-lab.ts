import { InformePDF, getAssetsURL } from '../model/informe.class';
import { InformeLabHeader } from './informe-header';
import { InformeLabBody } from './informe-body';
import { InformeLabFooter } from './informe-footer';

export class InformeLAB extends InformePDF {

    constructor(private encabezado, private detalle, private usuario: any) {
        super();
    }

    stylesUrl = [
        getAssetsURL('utils/sass/main.scss')
    ];

    public async process() {
        this.header = new InformeLabHeader(this.encabezado);
        this.body = new InformeLabBody(this.detalle);
        this.footer = new InformeLabFooter(this.encabezado.efector, this.usuario);
        await super.process();
    }
}
