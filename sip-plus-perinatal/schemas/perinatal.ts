export interface ISnomedConcept {
    conceptId: string,
    term: string,
    fsn: string,
    semanticTag: string
}


export type IPerinatal = {
    key: string,
    sipPlus: {
        code: string,
        type: string,
        extra?: any,
        valor?: any
    },
    concepto?: ISnomedConcept,
    tipoMatch: String,
};


