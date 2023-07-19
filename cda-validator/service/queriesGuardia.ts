
import { IQueryGuardia, QueryGuardia } from '../schemas/queriesGuardia';
import { MONGO_HOST } from '../config.private';
import { connect } from 'mongoose';

connect(MONGO_HOST, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Conexion Exitosa BD Mongo'))
    .catch(err => console.log('Error Conexion BD Mongo', err));


export async function getQueries(params = null) {
    const filter = params || {};
    try {
        const queries: IQueryGuardia[] = await QueryGuardia.find(filter);
        return queries;
    } catch (error) {
        return null;
    }
}
