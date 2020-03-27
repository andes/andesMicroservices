import { QueryMapping } from '../schemas/query_mapping';

export function mappingStream(columnName, source, target) {

    const tempMap = {};

    async function transformer(item) {
        const v = item[columnName];
        if (tempMap[v]) {
            item[columnName] = tempMap[v];
        } else {
            const targetValue: any = await QueryMapping.findOne({ source, target, sourceValue: v });
            if (targetValue) {
                item[columnName] = targetValue.targetValue;
                tempMap[v] = item[columnName];
            }
        }
        return item;
    }
    return transformer;
}

export async function applyMapping(datos, columnName, source, target) {
    const tempMap = {};
    for (const item of datos) {
        const v = item[columnName];
        if (tempMap[v]) {
            item[columnName] = tempMap[v];
        } else {
            const targetValue: any = await QueryMapping.findOne({ source, target, sourceValue: v });
            if (targetValue) {
                item[columnName] = targetValue.targetValue;
                tempMap[v] = item[columnName];
            }
        }
    }
}
