import { mongoDB } from './../config.private';

const MongoClient = require('mongodb').MongoClient;
const url = mongoDB.mongoDB_main.host;


export async function getAllQueries() {
  let client = await MongoClient.connect(url);
  let cursor = await client.db().collection('queries').find({});
  let queries = await cursor.toArray();
  // Close the connection
  client.close();
  return queries;
}

// const palQuery = ['#match', '#and', '#gte', '#lte', '#exists', '#unwind', '#project', '#group', '#lookup', '#addFields', '#slice', '#in', '#arrayElemAt'];

export async function descargarCSV(unaQuery) {
  let client = await MongoClient.connect(url);
  let db = await client.db();
  var collection = db.collection(unaQuery.coleccion); // nombre de la coleccion
  let pipelineSP = unaQuery.query;

  pipelineSP = JSON.parse(JSON.stringify(pipelineSP).replace(/#/g, '$'));

  let datosArgumentos = unaQuery.argumentos;

  if (datosArgumentos) {
    datosArgumentos.forEach((unArg: any) => {
      // let index = datos.argumentos.findIndex((a: any) => a.param === d.param);
      let replace = unArg.valor;
      if (unArg.tipo === 'date') { replace = parseDate(unArg.valor); }
      findValues(pipelineSP, unArg.key, unArg.param, replace);
    });
  }
  // console.log('objeto antes: ', JSON.stringify(unaQuery.query));
  // console.log('objeto despues:', JSON.stringify(pipelineSP));

  var respuesta = await collection.aggregate(pipelineSP);
  // console.log("Respuesta: ", respuesta);
  let pipe = await respuesta.toArray();
  client.close();
  // generamos archivo CSV
  const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
  let someObject = pipe[0];
  let csvHeader = [];
  for (let key in someObject) { // generamos el contenido del header: clave y nombre de las columnas del CSV
    csvHeader.push({ id: key, title: key });
  }
  const csvStringifier = createCsvStringifier({ // se crea header
    header: csvHeader
  });
  let ret = csvStringifier.getHeaderString() + await csvStringifier.stringifyRecords(pipe);
  // console.log("CSV= ", ret);
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
      // console.log("llama findHelper con i=", i, "y obj[i]", obj[i]);
      findValuesHelper(obj[i], key, valorBusq, valorReemp);
    }
  }
  else {
    if (obj[key] === valorBusq) {
      obj[key] = valorReemp;
      // console.log("Entra OBJ [KEY]", valorBusq);
    }
    if ((typeof obj === 'object') && (obj !== null)) {
      // console.log("Entra a typeof oBJEcttt");
      let children = Object.keys(obj);

      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          // console.log("Childrennnn: ", children, obj[children[i]]);
          findValuesHelper(obj[children[i]], key, valorBusq, valorReemp);
        }
      }
    }
  }

  // return;
}
// function convertirCadEspeciales(cadena: string) {
//   let cadAux = cadena;
//   palQuery.forEach(pal => {
//     cadAux = JSON.parse(JSON.stringify(cadAux).replace(new RegExp(pal, 'g'), '$' + pal));
//   });
//   return cadAux;
// }
