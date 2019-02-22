export interface IDtoFacturacion {
    turno: { _id: String; };
    paciente:
    {
        nombre: String;
        apellido: String;
        dni: String;
        fechaNacimiento: Date;
        sexo: String;
    };
    prestacion:
    {
        conceptId: String;
        term: String;
        fsn: String;
        datosReportables: [{
            conceptId: String,
            term: String,
            valor: String
        }]
    };
    organizacion:
    {
        nombre: String;
        cuie: String;
        idSips: Number;
    };
    obraSocial: {
        codigoFinanciador: String;
        financiador: String;
    };
    profesional:
    {
        nombre: String;
        apellido: String;
        dni: String;
    };
}
