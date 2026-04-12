import { MercadoPagoConfig, Preference } from 'mercadopago';

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
        unit_price: Number(item.precio), 
        quantity: parseInt(item.cantidad) || 1, 
        currency_id: "MXN",
    })),
    back_urls: { 
        success: "http://localhost:5500/pages/success.html", 
        failure: "http://localhost:5500/pages/carrito.html", 
        pending: "http://localhost:5500/pages/pending.html",
    },
    auto_return: "approved",
};
        const preference = new Preference(client);
        const result = await preference.create({ body });

        // Devolvemos el link de pago al frontend
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear el pago" });
    }
};
