import { HTMLComponent } from '../model/html-component.class';

export class InformeLabHeader extends HTMLComponent {
   
    template = `
    <!-- Datos paciente -->
    <span class="contenedor-principal-data">
        <div class="contenedor-secundario">
            <h5>Resultados de Laboratorio</h5>
            <h4>{{ organizacion }}</h4>
        </div>
        <div class="contenedor-secundario">
        </div>
    </span>
    <hr/>

    <div class="rTable" style="border: 1px solid #000;">
        <div class="rTableRow">
            <div class="rTableCell">
            &nbsp;Paciente: {{ paciente.apellido }}, {{ paciente.nombre }}
                <br/>&nbsp;DU: {{ paciente.documento }}
            </div>
            <div class="rTableCell">Fecha Nac.: {{ paciente.fechaNacimiento }}</div>
            <div class="rTableCell">Sexo: {{ paciente.sexo }} </div>
        </div>
    </div>
    <div class="rTable" style="border:1px solid #000;border-top: 0px">
        <div class="rTableRow" style="border: 1px solid #000!important;">
            <div class="rTableCell" style="margin-left:3px">
            &nbsp;Orden Nro: {{ orden.numero }}
                <br/>&nbsp;Origen: {{ orden.origen }}
            </div>
            <div class="rTableCell">Fecha: {{ orden.fecha }}<br/>Solicitante: {{ orden.solicitante }} </div>
            <div class="rTableCell">Prioridad: {{ orden.prioridad }} </div>
        </div>
    </div>
    <br/>`;

    constructor(public encabezado) {
        super();
        this.data = {
            paciente: {
                nombre: encabezado.nombre,
                apellido: encabezado.apellido,
                documento: encabezado.numeroDocumento,
                fechaNacimiento: encabezado.fechaNacimiento,
                sexo: encabezado.sexo === 'M' ? 'Masculino' : 'Femenino'
            },
            orden: {
                numero: encabezado.numero,
                origen: encabezado.origen,
                fecha: encabezado.fecha,
                solicitante: encabezado.solicitante,
                prioridad: encabezado.prioridad
            },
            organizacion: encabezado.Efector,
        };
    }
}
