import { mongoDB } from './../config.private';

const MongoClient = require('mongodb').MongoClient;
const url = mongoDB.mongoDB_main.host;

export async function getAllQueries() {
  let client = await MongoClient.connect(url);
  let cursor = await client.db().collection('queries').find({});
  let queries = await cursor.toArray();
  client.close();
  return queries;
}

export async function descargarCSV(unaQuery) {
  let client = await MongoClient.connect(url);
  let db = await client.db();
  var collection = db.collection(unaQuery.coleccion); // nombre de la coleccion
  let pipelineSP;
  try {
    pipelineSP = JSON.parse(unaQuery.query);
  } catch (err) {
  }

  let datosArgumentos = unaQuery.argumentos;

  if (datosArgumentos) {
    datosArgumentos.forEach((unArg: any) => {
      let replace = unArg.valor;
      if (unArg.tipo === 'date') { replace = parseDate(unArg.valor); }
      findValues(pipelineSP, unArg.key, unArg.param, replace);
    });
  }

  let pipe;
  try {
    let respuesta = await collection.aggregate(pipelineSP);
    pipe = await respuesta.toArray();
  } catch (err) {
  }
  client.close();
  let ret = null;
  if (pipelineSP.length > 0) {// generamos archivo CSV
    const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
    let someObject = pipe[0];
    let csvHeader = [];
    for (let key in someObject) { // generamos el contenido del header: clave y nombre de las columnas del CSV
      csvHeader.push({ id: key, title: key });
    }
    const csvStringifier = createCsvStringifier({ // se crea header
      header: csvHeader
    });
    ret = csvStringifier.getHeaderString() + await csvStringifier.stringifyRecords(pipe);
  }

  return ret;
}

function parseDate(fecha: any) {
  let x = Date.parse(fecha);
  return new Date(x);
}

function findValues(obj: any, key: any, valorBusq: any, valorReemp: any) {
  return findValuesHelper(obj, key, valorBusq, valorReemp);
}

function findValuesHelper(obj: any, key: any, valorBusq: any, valorReemp: any) {
  if (!obj) { return; }
  if (obj instanceof Array) {
    for (let i in obj) {
      findValuesHelper(obj[i], key, valorBusq, valorReemp);
    }
  }
  else {
    if (obj[key] === valorBusq) {
      obj[key] = valorReemp;
    }
    if ((typeof obj === 'object') && (obj !== null)) {
      let children = Object.keys(obj);

      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          findValuesHelper(obj[children[i]], key, valorBusq, valorReemp);
        }
      }
    }
  }
}

