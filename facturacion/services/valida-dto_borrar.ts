export class ValidaDTO {
    public result: any[] = [];

    getArrayDto(obj) {

        for (const prop in obj) {
            // console.log("Propertyyy: ", prop);
            const value = obj[prop];

            this.result.push(prop);
            if (typeof value === 'object') {
                this.getArrayDto(value);
            }
        }

        // console.log("Array de propiedades: ", this.result);
        return this.result;
    }

    validaDTO(obArray, objArrayEntrante) {
        let valido = true;

        for (let prop in obArray) {
            // console.log("OBJ ", obArray);
            // console.log("Entrante:", obArray[prop]);
            let index = objArrayEntrante.indexOf(obArray[prop]);

            if (index === -1) {
                console.log("No encuentra: ", obArray[prop]);
                valido = false;
            }
            console.log("Index; ", index);
        }

        return valido;
    }
}

export let dtoFactura = {
    turno: {
        _id: '',
    },
    paciente: {
        nombre: '',
        apellido: '',
        dni: '',
        fechaNacimiento: '',
        sexo: ''
    },
    prestacion: {
        conceptId: '',
        term: '',
        fsn: '',
        datosReportables: '',
    },
    organizacion: {
        nombre: '',
        cuie: '',
        idSips: ''
    },
    obraSocial: '',
    profesional: {
        nombre: '',
        apellido: '',
        dni: ''
    },
    pepe: 'hoa'
};
