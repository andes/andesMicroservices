import { QuerySchema } from '../schemas/query';

// import { ConsultasRepository } from '../repositories';
import * as moment from 'moment';
import { log } from '@andes/log';


const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

const MongoClient = require('mongodb').MongoClient;
import { mongoDB } from './../config.private';

const url = mongoDB.mongoDB_main.host;

export async function getAllQueries() {
  console.log("Entra a ALll Queries");
  let client = await MongoClient.connect(url);
  let db = await client.db();

  let cursor = await db.collection('queries').find({});
  let queries = await cursor.toArray();

  return queries;
}


export async function descargarCSV(unaQuery) {
  let client = await MongoClient.connect(url);
  let db = await client.db();
  
  let datos: any = {
    params: {
      _id: "5de903a501ecb1b3367d7f51",
      nombre: "Listado de Pacientes",
      coleccion: "agenda",
      // query: [{ '$match': { '$and': [{ 'createdAt': { '$gte': '@fechaInicio', '$lte': '@fechaFin' } }] } }, { '$addFields': { 'dire': { '$slice': ['$direccion', 0, 1] } } }, { '$unwind': '$dire' }, { '$project': { '_id': 1, 'nombre': 1, 'apellido': 1, 'documento': 1, 'sexo': 1, 'fechaNacimiento': 1, 'provincia': '$dire.ubicacion.provincia.nombre', 'localidad': '$dire.ubicacion.localidad.nombre', 'calle': '$dire.valor', 'pais': '$dire.ubicacion.pais.nombre' } }],
      query: [
        {
          "$match": {
            "$and": [{ "updatedAt": { "$gte": '@fechaInicio', "$lte": '@fechaFin' } }],
            'profesionales.0': { "$exists": true }
          }
        },
        { "$unwind": { "path": "$profesionales" } },
        { "$group": { "_id": { "idProfesional": "$profesionales._id", "idAgenda": "$_id" } } },
        { "$lookup": { "from": "profesional", "localField": "_id.idProfesional", "foreignField": "_id", "as": "dni" } },
        { "$unwind": "$dni" },
        { "$project": { "_id": 0, "idAgenda": "$_id.idAgenda", "idProfesional": "$_id.idProfesional", "documento": "$dni.documento" } }
      ],
      argumentos: [
        {
          key: "$gte",
          label: "Fecha de Inicio",
          param: "@fechaInicio",
          tipo: "date",
          componente: "FechaComponent",
          nombre: "fechaInicio",
          valor: "2017-11-01T15:56:51.785-03:00"
        },
        {
          key: "$lte",
          label: "Fecha de Fin",
          param: "@fechaFin",
          tipo: "date",
          componente: "FechaComponent",
          nombre: "fechaFin",
          valor: "2019-12-19T15:56:51.785-03:00"
        }
      ]
    }
  };

  var collection = db.collection(datos.params.coleccion); //name of db collection

  let datosArgumentos = datos.params.argumentos;
  console.log("Argumentos: ", datosArgumentos);

  let objeto = datos.params.query;

  datosArgumentos.forEach((d: any) => {
    console.log("Entra a datos Argumentos: ", d);
    let index = datos.params.argumentos.findIndex((a: any) => a.param === d.param);
    let replace;
    // d.value = fechas[index].fecha;
    console.log("D Value: ", d.valor);
    switch (datos.params.argumentos[index].tipo) {
      case 'date':
        replace = parseDate(d.valor);
        break;
    }
    datos.params.argumentos[index]['dato'] = replace;
    console.log("Datata de cero: ", datos.params.argumentos[index]['dato']);
    findValues(objeto, d.key, replace);
  });

  function parseDate(fecha: any) {
    console.log("Entra a parseDate");
    let x = Date.parse(fecha);
    return new Date(x);
  }

  function findValues(obj: any, key: any, argumentos: any) {
    console.log("Entra a findValues");
    return findValuesHelper(obj, key, argumentos);
  }

  function findValuesHelper(obj: any, key: any, data: any) {
    console.log("Entra a findValuesHelper: ", JSON.stringify(obj) + ' -- ' + key + ' -- ' + data);

    if (!obj) { return; }

    if (obj instanceof Array) {
      console.log("Entra a Instance of");
      for (let i in obj) {
        findValuesHelper(obj[i], key, data);
      }
      // return;
    }

    if (obj[key]) {
      console.log("Adentroooooo OBJ[KEYYY] ANtes: ", obj[key]);
      obj[key] = data;
      console.log("Adentroooooo OBJ[KEYYY] Despúes: ", obj[key]);
    }
    if ((typeof obj === 'object') && (obj !== null)) {
      console.log("Entra a typeof oBJEcttt");
      let children = Object.keys(obj);
      console.log("Childrennnn: ", children);
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          findValuesHelper(obj[children[i]], key, data);
        }
      }
    }
    // return;
  }

  console.log('objeto despues', JSON.stringify(objeto));

  var respuesta = await collection.aggregate(objeto);

  let pipe = await respuesta.toArray();
  console.log("Pepepepe: ", pipe);

  let csv = datos.params.coleccion + '.csv';

  let someObject = pipe[0] // JSON array
  let csvHeader = []
  for (let key in someObject) {
    csvHeader.push({ id: key, title: key });
  }

  const csvStringifier = createCsvStringifier({
    header: csvHeader
  });

  console.log(csvStringifier.getHeaderString());
  // => 'NAME,LANGUAGE\n'
  console.log(csvStringifier.stringifyRecords(pipe));
  let capo = await csvStringifier.stringifyRecords(pipe);

  return csvStringifier.stringifyRecords(pipe);
}
