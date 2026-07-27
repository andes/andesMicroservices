export class ParamsIncorrect extends Error {
    status = 400;
    message = 'parámetros incorrectos';
    constructor(motivo?: string) {
        super();
        this.message = motivo ? this.message + '. Motivo: ' + motivo : this.message;
    }
}
