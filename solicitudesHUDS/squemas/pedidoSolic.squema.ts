import * as mongoose from 'mongoose';

export type IPedidoSolic = {
    institucion: {
        id: number;
        nombre: string;
    };
    descripcion: string;
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
            id: { type: Number, required: true },
            nombre: { type: String, required: true }
        },
        descripcion: { type: String, required: true },
        adjuntos: [
            {
                nombre: String,
                path: String,
                size: Number,
                mimetype: String,
                fecha: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);



export const PedidoSolic = mongoose.model('pedidoSolic', PedidoSolicSchema);
