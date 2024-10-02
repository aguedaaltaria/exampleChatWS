const WebSocket = require('ws');
const Buffer = require('buffer').Buffer;

const wss = new WebSocket.Server({ port: 8084 }); 

let conectados = [];

wss.on('connection', function connection(ws) {
    let nuevoCliente = {
        ws: ws,
        id: conectados.length + 1
    };
    conectados.push(nuevoCliente);
    
    console.log(`Nuevo cliente conectado. Total de clientes: ${conectados.length}`);

    ws.send(JSON.stringify({
        type: 'conectados',
        contenido: nuevoCliente.id 
    }));

    ws.on('message', function incoming(message) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                console.log(message);
                let mensajeRecibido = JSON.parse(Buffer.from(message).toString());
                console.log(mensajeRecibido);
                let mensaje = JSON.stringify({
                    type: 'mensaje', 
                    contenido: mensajeRecibido.texto,
                    id: mensajeRecibido.numeroCliente
                });
                client.send(mensaje);
                console.log(`Cliente ${mensajeRecibido.numeroCliente} envió el mensaje: ${mensaje}`);
            }
        });
    });

    ws.on("close", () => {
        conectados = conectados.filter(c => c.ws !== ws);
        console.log(`Cliente desconectado. Total de clientes: ${conectados.length}`);
    });
});