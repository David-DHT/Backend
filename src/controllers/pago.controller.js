import { MercadoPagoConfig, Preference } from 'mercadopago';
import { crearVenta } from '../models/ventas.models.js';

// Configuramos el cliente con tu token que ya subiste a Vercel
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

export const crearPreferencia = async (req, res) => {
    try {
        const carrito = req.body; // El carrito que enviaremos desde el frontend

      const body = {
    items: carrito.map(item => ({
        title: item.nombre || "Producto", 
        unit_price: Number(item.precio) || 0, 
        quantity: parseInt(item.cantidad) || 1, 
        currency_id: "MXN",
    })),
    back_urls: {
        success: "https://frontend-alpha-three-ookdkrlwec.vercel.app/index.html", 
        failure: "https://frontend-alpha-three-ookdkrlwec.vercel.app/pages/carrito.html", 
        pending: "https://frontend-alpha-three-ookdkrlwec.vercel.app/index.html"
    },
    auto_return: "approved",

    notification_url: "https://backend-liard-alpha-37.vercel.app/api/pago/webhook",
    
    metadata: {
        detalles_carrito: JSON.stringify(carrito),
        id_trabajador: 1, // Aquí pones el ID por defecto para ventas web
        id_metodo_pago: 2
    }
};
        const preference = new Preference(client);
        const result = await preference.create({ body });
5
        // Devolvemos el link de pago al frontend
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el pago" });
    }
};

export const recibirWebhook = async (req, res) => {
    try {
        const { query } = req;
        const topic = query.topic || query.type;

        if (topic === "payment") {
            const paymentId = query.id || query['data.id'];
            
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.status === 'approved') {
                    console.log("Pago aprobado, insertando en base de datos...");

                    const detallesCarrito = JSON.parse(data.metadata.detalles_carrito);
                    const idTrabajador = data.metadata.id_trabajador;
                    const idMetodoPago = data.metadata.id_metodo_pago;

                    // El parche mágico: Buscamos 'id', si no está, buscamos 'id_producto'
                    const detallesParaBD = detallesCarrito.map(item => ({
                        id_producto: item.id || item.id_producto, 
                        cantidad: item.cantidad || item.quantity,
                        precio_unitario: item.precio || item.unit_price
                    }));

                    await crearVenta({
                        id_trabajador: idTrabajador,
                        id_metodo_pago: idMetodoPago,
                        detalles: detallesParaBD
                    });

                    console.log("¡Venta registrada con éxito en la Base de Datos!");
                }
            }
        }

        res.sendStatus(200); 
    } catch (error) {
        console.error("Error en el Webhook:", error);
        res.sendStatus(500);
    }
};