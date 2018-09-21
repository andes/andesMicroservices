export async function getData(pool, query): Promise<any> {
    return await pool.request().query(query);
}
