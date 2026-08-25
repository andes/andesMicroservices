import * as mongoose from 'mongoose';

export type IPedidoSolic = {
    institucion: {
        id: number;
        nombre: string;
    };
    descripcion: string;
    efector: {
        id: number;
        nombre: string;
    };
    efectorParticular?: string;
    solicitante: any;
    paciente: any;
    adjuntos: {
        nombre: string;
        path: string;
        size: number;
        mimetype: string;
        fecha: Date;
    }[];
};


export const PedidoSolicSchema = new mongoose.Schema(
    {
        institucion: {
            id: Number,
            nombre: String
        },
        descripcion: String,
        efector: {
            id: Number,
            nombre: String
        },
        efectorParticular: String,
        solicitante: { type: mongoose.Schema.Types.ObjectId, ref: 'solicitantes', required: true },
        paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'solicitudPac', required: true },
        adjuntos: [
            {
                nombre: String,
                path: String,
                size: Number,
                mimetype: String,
                fecha: { type: Date, default: Date.now }
            }
        ]
    } as any,
    { timestamps: true }
);



export const PedidoSolic = mongoose.model('pedidoSolic', PedidoSolicSchema);
