import { Medication, MedicationRequest } from '@andes/fhir';
import { send } from '../service/receta.service';

export function prescriptionEncode(data) {
    const pacienteId = data.prestacion.paciente.id;
    const profesionalId = data.prestacion.solicitud.profesional.id;
    const medicamentos = data.registro.valor.medicamentos;
    medicamentos.forEach(m => {
        let medicacion = m.generico;
        medicacion.id = m.id;
        medicacion.active = true; // Lo seteo como activo ya que no viene el campo desde la prescripción
        const MedicationFHIR = Medication.encode(medicacion);
        const MedicationRequestFHIR = MedicationRequest.encode(pacienteId, profesionalId, MedicationFHIR, data);
        // De acuerdo a la definición cada medicationRequest lleva un solo medicamento. Por lo q se crea el objeto y se envía a recetar
        send(MedicationRequestFHIR);
    });
}