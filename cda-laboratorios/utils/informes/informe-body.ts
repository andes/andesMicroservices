import { HTMLComponent } from '../model/html-component.class';

export class InformeLabBody extends HTMLComponent {
    template = `
        <main>
            <section class="contenedor-informe">
                <article class="cabezal-conceptos horizontal">
                    <div class="rTable">
                        {{#each areas}}
                        <div class="rTableRow">
                            <div class="rTableCell1" style="text-decoration:underline;padding: 4px 0 2px 0; ">{{area}}</div>
                            <div class="rTableCell2"></div>
                            <div class="rTableCell2"></div>
                            <div class="rTableCell2"></div>
                        </div>
                            {{#each grupos}}
                                {{#if item}}
                                    <div class="rTableRow">
                                        <div class="rTableCell1">
                                            {{#if esTitulo}}<span style="text-decoration:underline;">{{/if}}
                                            {{item.nombre}} 
                                            {{#if esTitulo}}</span>{{/if}}
                                        </div>
                                        <div class="rTableCell2">{{item.resultado}}</div>
                                        <div class="rTableCell2 small" style="font-size:.125cm;font-style:italic;">
                                            {{#if item.valorReferencia}}
                                                {{ item.valorReferencia }}
                                            {{/if}}
                                            {{item.metodo}}
                                        </div>
                                        <div class="rTableCell2 small" style="font-size:.125cm;font-style:italic;">
                                            {{item.firma}}
                                        </div>
                                    </div>
                                {{/if}}
                                {{#if grupo}}
                                    <div class="rTableRow">
                                        <div class="rTableCell1">{{grupo}}</div>
                                        <div class="rTableCell2"></div>
                                        <div class="rTableCell2 small"></div>
                                        <div class="rTableCell2 small"></div>
                                    </div>
                                {{/if}}
                                {{#each items}}
                                    <div class="rTableRow">
                                        <div class="rTableCell1">
                                            &emsp;&emsp;
                                            {{#if esTitulo}}<span style="text-decoration:underline;">{{/if}}
                                        {{nombre}}</div>
                                        {{#if esTitulo}}</span>{{/if}}
                                        <div class="rTableCell2">{{resultado}}</div>
                                        <div class="rTableCell2 small">
                                            {{#if valorReferencia}}
                                                {{ valorReferencia }}
                                            {{/if}}
                                            {{metodo}}
                                        </div>
                                        <div class="rTableCell2 small">{{firma}}</div>
                                    </div>
                                {{/each}}
                            {{/each}}
                        {{/each}}
                    </div>
                </article>
            </section>
        </main>
    `;

    constructor(public detalle) {
        super();
    }

    public async process() {
        const setAreas = new Set(this.detalle.map(d => d.area));
        const areasStr = Array.from(setAreas);

        const areas = []
        areasStr.forEach(area => {
            const detallesArea = this.detalle.filter(d => d.area === area);
            const setGrupos = new Set(detallesArea.map(d => d.grupo));
            const grupos = Array.from(setGrupos);
        
            let item = {
                area,
                grupos: grupos.map(g => {
                    const detallesAreaGrupo = detallesArea.filter(da => da.grupo === g);
                    const res: any = {};

                    const toItem = (e) => ({
                        nombre: e.item,
                        esTitulo: e.esTitulo === 'Si' ? true : false,
                        resultado: e.resultado,
                        metodo: e.metodo,
                        valorReferencia: e.valorReferencia,
                        firma: e.esTitulo === 'Si' ? '' : e.profesional_val
                    });
                    
                    if (detallesAreaGrupo.length === 1 && detallesAreaGrupo[0].grupo === g) {
                        res.item = toItem(detallesAreaGrupo[0]);
                    } else {
                        res.grupo = g;
                        res.items = detallesAreaGrupo.map(toItem);
                    }

                    return res;
                })
            };

            areas.push(item);
        }); 
        this.data = {
            areas
        };
    }
}
