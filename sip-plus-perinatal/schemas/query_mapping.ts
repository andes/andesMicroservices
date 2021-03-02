import * as mongoose from 'mongoose';

export const QueryMappingSchema = new mongoose.Schema({
    sourceKey: String,
    sourceValue: mongoose.SchemaTypes.Mixed,
    targetKey: String,
    targetValue: mongoose.SchemaTypes.Mixed
});

export const QueryMapping = mongoose.model('queriesMapping', QueryMappingSchema, 'queries_mapping');
