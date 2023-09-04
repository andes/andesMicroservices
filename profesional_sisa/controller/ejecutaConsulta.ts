import { postProfesionalSISA, crearProfesionalSISA } from '../service/operaciones.service';


export async function exportSISA(profesional) {
    let postsSISA = [];

    if (isMatriculado(profesional)) {
        let formacionesGrado = profesional.formacionGrado.filter(async e => e.matriculado);
        for (let formacionGrado of formacionesGrado) {
            let profesionalSisa = await crearProfesionalSISA(profesional, formacionGrado);
            postsSISA.push(postProfesionalSISA(profesionalSisa));
        }
    }

    return await Promise.all(postsSISA);
}

function isMatriculado(profesional) {
    return profesional.formacionGrado && profesional.formacionGrado.length && profesional.formacionGrado.find(e => e.matriculado);
}