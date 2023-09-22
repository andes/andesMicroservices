import moment = require("moment");
import { HTMLComponent } from "../model/html-component.class";

export class InformeCDABody extends HTMLComponent {
  template = `
  <div class="org"><b>{{efector}}</b></div>
  <div class="rectangulo"><b>PACIENTE</b></div>
  <div class="column">
    <table>
    	<tr>
        <td><div class="rectPeq"><b>D.N.I.</b></div></td>
        <td>{{documento}}</td>
      </tr>
		  <tr>
        <td><div class="rectPeq"><b>Historia Clínica:</b></div></td>
        <td> {{historiaClinica}} </td>
      </tr>
      <tr>
			  <td><div class="rectPeq"><b>Apellido y nombre:</b></div></td>
        <td>{{nombre}}</td>
      </tr>
      <tr>
        <td><div class="rectPeq"><b>Edad:</b></div></td>
        <td> {{edad}} </td>
      </tr>
    </table>
  </div>
  <div class="column">
    <table>
      <tr>
        <td><div class="rectPeq"><b>Sexo:</b></div></td>
        <td>{{sexo}}</td>
      </tr>
      <tr>
        <td><div class="rectPeq"><b>Domicilio:</b></div></td>
        <td>{{domicilio}}</td>
      </tr>
      <tr>
        <td><div class="rectPeq"><b>Obra social:</b></div></td>
        <td>{{obraSocial}}</td>
      </tr>
      <tr>
        <td><div class="rectPeq"><b>Fecha Nacim:</b></div></td>
        <td>{{fechaNacimiento}}</td>
      </tr>
    </table>
  </div>
  <div class="clearfix"></div>
  <div class="rectangulo"><b>INFORMACIÓN DE INGRESO</b></div>
    <div class="column">
        <table>
    	    <tr>
        	  <td><div class="rectPeq"><b>Fecha ingreso:</b></div></td>
            <td>{{fechaIngreso}}</td>
          </tr>
		      <tr>
            <td><div class="rectPeq"><b>Fecha atención:</b></div></td>
              <td>{{fechaAtencion}} </td>
            </tr>
        </table>
    </div>
    <div class="column">
        <table>
    	    <tr>
        	    <td><div class="rectPeq"><b>Forma de ingreso:</b></div></td>
                <td>{{formaIngreso}}</td>
            </tr>

		    <tr>
                <td><div class="rectPeq"><b>Motivo de consulta:</b></div></td>
                <td>{{motivoConsulta}} </td>
            </tr>
        </table>
   </div>
   <div class="clearfix"></div>
   <div class="rectangulo"><b>INFORMACIÓN DE ENFERMERIA</b></div>
   <div class="col colFecha">
		<div><b>Fecha</b></div>
   </div>
   <div class="col colEnferm">
		<div><b>Enfermero</b></div>
   </div>
   <div class="col colTipo">
		<div><b>Tipo</b></div>
   </div>
   <div class="col colAnotacion">
		<div><b>Anotación</b></div>
   </div>
   <div class="clearfix"></div>
   
    {{#each anotaciones}}
        <div class="col2 colFecha">
		    <div>{{fecha}}</div>
        </div>
        <div class="col2 colEnferm">
		    <div>{{enfermero}}</div>
        </div>
        <div class="col2 colTipo">
		    <div>{{tipo}}</div>
        </div>
        <div class="col2 colAnotacion">
		    <div>{{anotacion}}</div>
        </div>
        <div class="clearfix"></div>
   {{/each}}

    <div class="rectangulo"><b>VALORACIÓN DE ENFERMERIA</b></div>
    <div class="col3 colHora">
		  <div><b>Hora</b></div>
    </div>
    <div class="col3 colHora">
		  <div><b>Tensión</b></div>
    </div>
    <div class="col3 colTen">
		  <div><b>FC</b></div>
    </div>
    <div class="col3 colTen">
		  <div><b>FR</b></div>
    </div>
    <div class="col3 colTen">
		  <div><b>T°</b></div>
    </div>
    <div class="col3 colTen">
		  <div><b>SAT</b></div>
    </div>
    <div class="col3 colGlow">
		  <div><b>GLASGOW</b></div>
        <table>
        	<tr>
            	<td class="inner-column"><b>O</b></td>
     	 		<td class="inner-column"><b>V</b></td>
      			<td class="inner-column"><b>M</b></td>
            </tr>
        </table>
    </div>
    <div class="col3 colPeso">
		  <div><b>Peso</b></div>
    </div>
    <div class="col3 colGlow">
		  <div><b>Pupilas</b></div>
    </div>
    <div class="col3 colSen">
		  <div><b>Sensorio</b></div>
    </div>
    <div class="col3 colSen">
		  <div><b>Sibilan.</b></div>
    </div>
    <div class="col3 colSen">
		  <div><b>Musc Acc.</b></div>
    </div>
    <div class="col3 colObs">
		  <div><b>observaciones</b></div>
    </div>
    <div class="clearfix"></div>
    <div class="custom-hr"></div>

    <!-- INICIO DE REPETITIVA -->
    {{#each valoracionEnfermeria}}
	    <div class="col3 colHora">
		    <div>{{hora}}</div>
        </div>
        <div class="col3 colHora">
		      <div>{{tension}}</div>
        </div>
        <div class="col3 colTen">
		      <div>{{fc}}</div>
        </div>
        <div class="col3 colTen">
		      <div>{{fr}}</div>
        </div>
        <div class="col3 colTen">
		      <div>{{temp}}°</div>
        </div>
        <div class="col3 colTen">
		      <div>{{sat}}</div>
        </div>
        <div class="col3 colTen">
		      <div>{{glas_ocular}}</div>
        </div>
        <div class="col3 colTen">
		      <div>{{glas_verbal}}</div>
        </div>
        <div class="col3 colTen">
		      <div>{{glas_motor}}</div>
        </div>
        <div class="col3 colPeso">
		      <div>{{peso}}</div>
        </div>
        <div class="col3 colGlow">
		      <div>{{pup_tam}}</div>
        </div>
        <div class="col3 colSen">
		      <div>{{sensor}}</div>
        </div>
        <div class="col3 colSen">
		      <div>{{sibilan}}</div>
        </div>
        <div class="col3 colSen">
		      <div>{{muscAcc}}</div>
        </div>
        <div class="col3 colObs">
		      <div>{{observaciones}}</div>
        </div>
        <div class="clearfix"></div>
   {{/each}}
   <!-- FIN DE REPETITIVA -->

    <div class="rectangulo"><b>INTERCONSULTAS</b></div>
    <div class="colB colEgre">
		  <div><b>Solicitado</b></div>
    </div>
    <div class="colB colInter">
		  <div><b>Practica</b></div>
    </div>
    <div class="colB colInter">
		  <div><b>Estado</b></div>
    </div>
    <div class="col colInter">
		  <div><b>Fecha</b></div>
    </div>
    <div class="col colInter2">
		  <div><b>Med Informa</b></div>
    </div>
    <div class="col colInter">
		  <div><b>Informe</b></div>
    </div>
    <div class="col colInter2">
		  <div><b>Observaciones</b></div>
    </div>
    <div class="clearfix"></div>
   
    <!-- INICIO DE REPETITIVA -->
    {{#each interconsultas}}
        <div class="col2 colInter">
		      <div>{{solicitadoDia}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{solicitadoPor}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{practica}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{estado}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{fecha}}</div>
        </div>
        <div class="col2 colInter2">
		      <div>{{medico}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{informe}}</div>
        </div>
        <div class="col2 colInter2">
		      <div>{{observacion}}</div>
        </div>
        <div class="clearfix"></div>
    {{/each}}
    <!-- FIN DE REPETITIVA -->
   
    <div class="rectangulo"><b>ESTUDIOS COMPLEMENTARIOS</b></div>
    <div class="colB colEgre">
		  <div><b>Solicitado</b></div>
    </div>
    <div class="colB colInter">
		  <div><b>Practica</b></div>
    </div>
    <div class="colB colInter">
		  <div><b>Estado</b></div>
    </div>
    <div class="col colInter">
		  <div><b>Fecha</b></div>
    </div>
    <div class="col colInter2">
		  <div><b>Med Informa</b></div>
    </div>
    <div class="col colInter">
		  <div><b>Informe</b></div>
    </div>
    <div class="col colInter2">
		  <div><b>Observaciones</b></div>
    </div>
    <div class="clearfix"></div>

    <!-- INICIO DE REPETITIVA -->
    {{#each estudios}}
        <div class="col2 colInter">
		    <div>{{solicitadoDia}}</div>
        </div>
        <div class="col2 colInter">
		    <div>{{solicitadoPor}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{practica}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{estado}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{fecha}}</div>
        </div>
        <div class="col2 colInter2">
		      <div>{{medico}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{informe}}</div>
        </div>
        <div class="col2 colInter2">
		      <div>{{observacion}}</div>
        </div>
        <div class="clearfix"></div>
    {{/each}}
    <!-- FIN DE REPETITIVA -->

    <div class="rectangulo"><b>PROCEDIMIENTOS ENFERMERIA</b></div>
    <div class="colB colEgre">
		  <div><b>Solicitado</b></div>
    </div>
    <div class="colB colInter">
		  <div><b>Practica</b></div>
    </div>
    <div class="colB colInter">
		  <div><b>Estado</b></div>
    </div>
    <div class="col colInter">
		  <div><b>Fecha</b></div>
    </div>
    <div class="col colInter2">
		  <div><b>Med Informa</b></div>
    </div>
    <div class="col colInter">
		  <div><b>Informe</b></div>
    </div>
    <div class="col colInter2">
		  <div><b>Observaciones</b></div>
    </div>
    <div class="clearfix"></div>

    <!-- INICIO DE REPETITIVA -->
    {{#each procedimientosEnfermeria}}
        <div class="col2 colInter">
		      <div>{{solicitadoDia}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{solicitadoPor}}</div>
        </div>
        <div class="col2 colInter">
		     <div>{{practica}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{estado}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{fecha}}</div>
        </div>
        <div class="col2 colInter2">
		      <div>{{medico}}</div>
        </div>
        <div class="col2 colInter">
		      <div>{{informe}}</div>
        </div>
        <div class="col2 colInter2">
		      <div>{{observacion}}</div>
        </div>
        <div class="clearfix"></div>
    {{/each}}
    <!-- FIN DE REPETITIVA -->

    <div class="rectangulo"><b>PRESCRIPCIONES</b></div>
    <div class="colB colPre1">
		<div><b>INDICACIONES MÉDICAS </b></div>
    </div>
    <div class="col colPre1">
		<div><b>NOTAS DE ENFERMERÍA</b></div>
    </div>
    </br>
    <div class="clearfix"></div>
    <div class="colB colFecha">
		  <div><b>Fecha</b></div>
    </div>
    <div class="colB colTipo">
		  <div><b>Indicación</b></div>
    </div>
    <div class="colB colTipo">
		  <div><b>Médico</b></div>
    </div>
    <div class="col colFecha">
		  <div><b>Fecha</b></div>
    </div>
    <div class="col colTipo">
		  <div><b>Anotación</b></div>
    </div>
    <div class="col colTipo">
		  <div><b>Enfermero</b></div>
    </div>
    <div class="clearfix"></div>

    <!-- INICIO DE REPETITIVA -->
    {{#each prescripciones}}
        <div class="col2 colFecha">
		      <div>{{fechaMedica}}</div>
        </div>
        <div class="col2 colTipo">
		      <div>{{indicacion}}</div>
        </div>
        <div class="col2 colTipo">
		      <div>{{medico}}</div>
        </div>
        <div class="col2 colFecha">
		      <div>{{fechaEnfer}}</div>
        </div>
        <div class="col2 colTipo">
		      <div>{{anotacion}}</div>
        </div>
        <div class="col2 colTipo">
		      <div>{{enfermero}}</div>
        </div>
        <div class="clearfix"></div>
    {{/each}}
    <!-- FIN DE REPETITIVA -->

    <div class="rectangulo"><b>DIAGNÓSTICOS CIE10</b></div>
	<div class="col colEnferm">
		<div><b>Fecha</b></div>
    </div>
    <div class="col colMedico">
		<div><b>Médico</b></div>
    </div>
    <div class="col colFecha">
		<div><b>Tipo</b></div>
    </div>
    <div class="col column">
		<div><b>Diagnóstico Cie10</b></div>
    </div>
    <div class="clearfix"></div>

    <!-- INICIO DE REPETITIVA -->
    {{#each diagnosticos}}
        <div class="col2 colEnferm">
		      <div>{{fecha}}</div>
        </div>
        <div class="col2 colMedico">
		      <div>{{medico}}</div>
        </div>
        <div class="col2 colFecha">
		      <div>{{tipo}}</div>
        </div>
        <div class="col2 column">
		      <div>{{diagnostico}}</div>
        </div>
        <div class="clearfix"></div>
    {{/each}}
    <!-- FIN DE REPETITIVA -->

    </br>
    <div class="medicResp colDiag margenDerecho"><b>DIAGNÓSTICOS CIE10</b></div>
    <div class="medicResp colEnfEgr"><b>DIAGNÓSTICOS CIE10</b></div>
    <div class="clearfix"></div>
    <div class="col colDiag margenDerecho"><b>Nombre</b></div>
    <div class="col colEnferm"><b>Fecha</b></div>
    <div class="col colEgre"><b>Tipo de egreso</b></div>
    <div class="col colEgre"><b>Observaciones</b></div>
    <div class="clearfix"></div>
    <div class="colB colDiag margenDerecho">{{medicoResp}}</div>
    <div class="colB colEnferm">{{fechaEgreso}}</div>
    <div class="colB colEgre">{{tipoEgreso}}</div>
    <div class="colB colEgre">{{observaciones}}</div>
    <div class="colFirma"><b>Firma y sello del profesional</b></div
    <div class="clearfix"></div>
  `;
  constructor(public detalle, public paciente, public organizacion) {
    super();
  }

  public async process() {
    const anotaciones = [];
    const valoracionEnfermeria = [];
    const interconsultas = [];
    const estudios = [];
    const procedimientosEnfermeria = [];
    const prescripciones = [];
    const diagnosticos = [];
    if (this.detalle.anotacionesEnfermeria) {
      this.detalle.anotacionesEnfermeria.forEach(anotacion => {
        let item = {
          fecha: (anotacion.fecha) ? moment(anotacion.fecha).format('DD/MM/YYYY HH:mm') : null,
          enfermero: `${anotacion.enfermero[0].nombre} ${anotacion.enfermero[0].apellido}`,
          tipo: anotacion.tipoAnotacion,
          anotacion: anotacion.Observacion
        };
        anotaciones.push(item);
      });
    }

    if (this.detalle.valoracionEnfermeria) {
      this.detalle.valoracionEnfermeria.forEach(anotacionEnfermeria => {
        let item = {
          hora: (anotacionEnfermeria.fechaHora) ? moment(anotacionEnfermeria.fecha).format('DD/MM/YYYY HH:mm') : null,
          tension: anotacionEnfermeria.tensionArterial,
          fc: anotacionEnfermeria.frecuenciaCardiaca,
          fr: anotacionEnfermeria.frecuenciaRespiratoria,
          temp: anotacionEnfermeria.temperatura,
          sat: anotacionEnfermeria.saturacionOxigeno,
          glas_ocular: anotacionEnfermeria.glasgow_ocular,
          glas_verbal: anotacionEnfermeria.glasgow_verbal,
          glas_motor: anotacionEnfermeria.glasgow_motor,
          peso: anotacionEnfermeria.peso,
          pup_tam: anotacionEnfermeria.pupilas_tamano,
          pup_react: anotacionEnfermeria.pupilas_reactividad,
          pup_sim: anotacionEnfermeria.pupilas_simetria,
          sensor: anotacionEnfermeria.sensorio,
          sibilan: anotacionEnfermeria.sibilancia,
          muscAcc: anotacionEnfermeria.muscAccesorio,
          observaciones: anotacionEnfermeria.observaciones
        }
        valoracionEnfermeria.push(item);
      });
    }

    if (this.detalle.interconsultas) {
      this.detalle.interconsultas.forEach(interconsulta => {
        let item = {
          solicitadoDia: (interconsulta.fecha) ? moment(interconsulta.fecha).format('DD/MM/YYYY HH:mm') : null,
          solicitadoPor: (interconsulta.usuarioSolicita) ? `${interconsulta.usuarioSolicita[0].nombre} ${interconsulta.usuarioSolicita[0].apellido}` : null,
          practica: interconsulta.practica,
          estado: interconsulta.estado,
          informe: interconsulta.informeMedicoInterconsultor,
          observacion: interconsulta.observaciones,
        }
        interconsultas.push(item);
      });
    }

    if (this.detalle.estudios) {
      this.detalle.estudios.forEach(estudio => {
        let item = {
          solicitadoDia: (estudio.fecha) ? moment(estudio.fecha).format('DD/MM/YYYY HH:mm') : null,
          solicitadoPor: (estudio.usuarioSolicita) ? `${estudio.usuarioSolicita[0].nombre} ${estudio.usuarioSolicita[0].apellido}` : null,
          practica: estudio.practica,
          estado: estudio.estado,
          informe: estudio.informeMedicoInterconsultor,
          observacion: estudio.observaciones,
        }
        estudios.push(item);
      });
    }

    if (this.detalle.procedimientosEnfermeria) {
      this.detalle.procedimientosEnfermeria.forEach(procedimiento => {
        let item = {
          solicitadoDia: (procedimiento.fecha) ? moment(procedimiento.fecha).format('DD/MM/YYYY HH:mm') : null,
          solicitadoPor: (procedimiento.usuarioSolicita) ? `${procedimiento.usuarioSolicita[0].nombre} ${procedimiento.usuarioSolicita[0].apellido}` : null,
          practica: procedimiento.practica,
          estado: procedimiento.estado,
          informe: procedimiento.informeMedicoInterconsultor,
          observacion: procedimiento.observaciones,
        }
        procedimientosEnfermeria.push(item);
      });
    }

    if (this.detalle.prescripciones) {
      this.detalle.prescripciones.forEach(prescrip => {
        let item = {
          fechaMedica: (prescrip.fecha) ? moment(prescrip.fecha).format('DD/MM/YYYY HH:mm') : null,
          indicacion: prescrip.prescripcion,
          medico: (prescrip.medico) ? `${prescrip.medico[0].nombre} ${prescrip.medico[0].apellido}` : null,
          fechaEnfer: (prescrip.fechaRealizada) ? moment(prescrip.fechaRealizada).format('DD/MM/YYYY HH:mm') : null,
          anotacion: prescrip.observacion,
          enfermero: (prescrip.enfermero) ? `${prescrip.enfermero[0].nombre} ${prescrip.enfermero[0].apellido}` : null
        }
        prescripciones.push(item);
      });
    }

    let item = {}
    if (this.detalle.diagnosticos) {
      this.detalle.diagnosticos.forEach(diagnostico => {
        item = {
          fecha: (diagnostico.fecha) ? moment(diagnostico.fecha).format('DD/MM/YYYY HH:mm') : null,
          medico: `${diagnostico.audit_user[0].nombre} ${diagnostico.audit_user[0].apellido}`,
          tipo: (diagnostico.tipoDiagnostico === 1) ? 'Principal' : 'Secundario',
          diagnostico: `${diagnostico.CodigoCie} - ${diagnostico.DescCie}`
        }
      });
    } else {
      item = {
        fecha: (this.detalle.fechaEgreso) ? moment(this.detalle.fechaEgreso).format('DD/MM/YYYY HH:mm') : null,
        medico: this.detalle.medicoResp,
        tipo: 'Principal',
        diagnostico: this.detalle.CodigoCIE10
      }
    }
    diagnosticos.push(item);

    this.data = {
      documento: this.detalle.documento,
      historiaClinica: this.detalle.historiaID || this.detalle.hc_historia,
      nombre: this.detalle.nombre,
      edad: this.detalle.edad,
      sexo: this.detalle.sexo,
      domicilio: this.detalle.direccion || this.paciente.direccion,
      obraSocial: this.detalle.obraSocial,
      fechaNacimiento: (this.paciente.fechaNacimiento) ? moment(this.paciente.fechaNacimiento).format('DD/MM/YYYY') : null,
      fechaIngreso: (this.detalle.fechaIngreso) ? moment(this.detalle.fechaIngreso).format('DD/MM/YY HH:mm') : null,
      fechaAtencion: (this.detalle.fechaAtencion) ? moment(this.detalle.fechaAtencion).format('DD/MM/YY HH:mm') : null,
      formaIngreso: this.detalle.tipoIngreso,
      motivoConsulta: this.detalle.motivoConsulta || this.detalle.datosExtra[0].guardiaMotivoConsulta,
      anotaciones,
      valoracionEnfermeria,
      interconsultas,
      estudios,
      procedimientosEnfermeria,
      prescripciones,
      diagnosticos,
      medicoResp: this.detalle.medicoResp,
      fechaEgreso: (this.detalle.fechaEgreso) ? moment(this.detalle.fechaEgreso).format('DD/MM/YY HH:mm') : null,
      tipoEgreso: this.detalle.tipoEgreso,
      observaciones: this.detalle.datosExtra[0].egresoObservacion,
      efector: this.organizacion.nombre
    }
  }
}