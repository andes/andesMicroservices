export const ANDES_HOST = '';
export const ANDES_KEY = '';

//para ver laboratorios de sips
export const conSql = {
    auth: {
        user: '',
        password: ''
    },
    serverSql: {
        server: '',
        database: ''
    },
    pool: {
        acquireTimeoutMillis: 15000
    }
};


//id de efectores SIL2 (no se generan cdas)
//export const idEfectoresSIL2 = []; //-> cambiado por efectoresFiltradosSIL2

//efectoresFiltrados: Por cada efector que fue migrado al SIL2 (idSips) se debe colocar
// la fecha hasta la fecha que se uso por ultima vez el SIL 1
//y si no migro se coloca la fecha vacia
export const efectoresFiltradosSIL2  = [
    {
        "idSips": 0,
        "nombre": "",
        "fechaHasta": ""
    }
]

export const logDatabase = {
    log: {
        host: `mongodb://localhost:27017/andesLogs`,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }
    }
};

// User scheduler
export const userScheduler = {
    user: {
        usuario: {
            nombre: 'Andes',
            apellido: 'Scheduler'
        },
        organizacion: {
            nombre: 'Andes'
        }
    },
    ip: '0.0.0.0',
    connection: {
        localAddress: '0.0.0.0'
    }
};













