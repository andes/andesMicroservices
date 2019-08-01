import { queryEfector } from './queryEfector';
import { hpn } from './hpn';
import { heller } from './heller';

export function queries(efector: any, paciente: any) {
    let query = {};

    switch (efector) {
        case 'hpn':
            query = hpn(efector, paciente);
            break;
        case 'heller':
            query = heller(efector, paciente);
            break;
        default:
            query = queryEfector(efector, paciente);
            break;
    }

    return query;
}
