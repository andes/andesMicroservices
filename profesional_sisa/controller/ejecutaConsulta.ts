import { postProfesionalSISA, crearProfesionalSISA, patchProfesional } from '../service/operaciones.service';


export async function exportSISA(profesional) {
    let postsSISA = [];
    if (isMatriculado(profesional)) {
        let formacionesGrado = profesional.formacionGrado.filter(async e => e.matriculado);
        for (let formacionGrado of formacionesGrado) {
            let profesionalSisa = await crearProfesionalSISA(profesional, formacionGrado);
            postsSISA.push(postProfesionalSISA(profesionalSisa));
        }
    }

    return await Promise.all(postsSISA)
        .then(async resultados => {
            for (let i = 0; i < resultados.length; i++) {
                if (resultados[i]?.idProfesional) {
                    profesional.formacionGrado[i].configuracionSisa = {
                        idProfesional: resultados[i].idProfesional,
                        idProfesion: resultados[i].idProfesion,
                        idMatricula: resultados[i].idMatricula,
                        codigoProfesional: resultados[i].codigoProfesional
                    }
                }
            }
            await patchProfesional(profesional.id, profesional.formacionGrado);
            return resultados;
        })
        .catch(error => {
            console.error("Una de las promesas falló:", error);
        });
}

function isMatriculado(profesional) {
    return profesional.formacionGrado && profesional.formacionGrado.length && profesional.formacionGrado.find(e => e.matriculado);
}