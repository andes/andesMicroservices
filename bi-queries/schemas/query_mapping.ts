import * as mongoose from 'mongoose';

export const QueryMappingSchema = new mongoose.Schema({
    sourceKey: String,
    sourceValue: String,
    targetKey: String,
    targetValue: String
});

export const QueryMapping = mongoose.model('queriesMapping', QueryMappingSchema, 'queries_mapping');
