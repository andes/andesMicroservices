import { format } from '@fast-csv/format';

export function csvTransform() {
    return format({ headers: true });
}
