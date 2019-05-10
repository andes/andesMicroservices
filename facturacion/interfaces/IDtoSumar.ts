export interface IDtoSumar {
    idPrestacion: String,
    fechaTurno: Date,
    objectId: String;
    cuie: String;
    diagnostico: String;
    dniPaciente: String;
    claveBeneficiario: String;
    idAfiliado: Number;
    edad: Number;
    sexo: String;
    fechaNacimiento: Date;
    anio: String;
    mes: String;
    dia: String;
    datosReportables: [{
        idDatoReportable: Number,
        datoReportable: String
    }];
}