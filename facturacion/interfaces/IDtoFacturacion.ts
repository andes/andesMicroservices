export interface IDtoFacturacion {
    idPrestacion: String;
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
        codOS: String;
        financiador: String;
        idObraSocial: String;
        prepaga: Boolean;
        codigoPuco: String;
    };
    profesional:
    {
        nombre: String;
        apellido: String;
        dni: String;
    };
}
