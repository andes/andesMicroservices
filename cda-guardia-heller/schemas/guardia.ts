export interface IGuardia {
    id?: string,
    file: any;             //archivo PDF de guardia binary.
    fecha: Date;
    paciente: {
        id?: string,       //si lo tuvieran
        nombre: string,
        apellido: string,
        documento: string,
        sexo: string,
        fechaNacimiento: Date
    },
    profesional: {
        nombre: string,
        apellido: string,
        documento: string
    },
    organizacion: any,
    tipoPrestacion: string,
    cie10: string,
    confidencialidad: string,
}
