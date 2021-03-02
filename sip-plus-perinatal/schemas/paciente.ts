
export interface IPaciente {
    documento: string,
    nombre: string,
    apellido: string,
    fechaNacimiento: string,
    gestas?: any,
    domicilio?: string,
    localidad?: string,
    telefono?: string,
    edad?: number
}