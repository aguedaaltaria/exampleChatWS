let formulario = document.querySelector('form');
let mensaje = document.getElementById("mensaje");
let input = document.querySelector('input[type="text"]');
let cliente = null;

const coloresGlobales = [];
for (let i = 0; i < 10; i++) { 
    let colorClaro = generarColorClaro();
    let colorOscuro = oscurecerColor(colorClaro);
    let colores = convertirHexa(colorClaro, colorOscuro);
    coloresGlobales.push(colores);
}
let coloresPorCliente = {};

const ws = new WebSocket('ws://localhost:8084');

ws.onopen = () => {
    console.log('Conexión establecida con el servidor');
};

formulario.addEventListener('submit', function(event) {
    event.preventDefault();
    let textoInput = input.value;
    let mensajeEnviar = {
        texto: textoInput,
        numeroCliente: cliente
    }

    ws.send(JSON.stringify(mensajeEnviar)); 
    input.value = '';
});

ws.onmessage = function(event) {
    let mensajeRecibido = event.data;
    let mensajeParseado = JSON.parse(mensajeRecibido);

    if (mensajeParseado.type === 'conectados') {
        console.log(`Eres el cliente ${mensajeParseado.contenido}`);
        cliente = mensajeParseado.contenido;

        if (coloresGlobales.length > 0) { 
            coloresPorCliente[cliente] = coloresGlobales.shift(); 
            } else {
            console.error("Ya no hay más colores disponibles");
        }
    } else {
        let contenidoMensaje = mensajeParseado.contenido;
        let idEmisor = mensajeParseado.id; 
        let nuevoParrafo = document.createElement('p');
        nuevoParrafo.textContent = contenidoMensaje;

        if (!(idEmisor in coloresPorCliente)) {
            if (coloresGlobales.length > 0) {
                coloresPorCliente[idEmisor] = coloresGlobales.shift();
            } else {
                console.error("Ya no hay más colores disponibles"); 
            }
        }

        let [colorClaroHexa, colorOscuroHexa] = coloresPorCliente[idEmisor];
        nuevoParrafo.style.backgroundColor = colorClaroHexa;
        nuevoParrafo.style.border = `1px solid ${colorOscuroHexa}`;
        mensaje.appendChild(nuevoParrafo);
    }
};

ws.onclose = () => {
    console.log("Conexión WebSocket cerrada");
};

function generarColorClaro() {
    let minS = 600; 
    let maxS = 765;
    let s = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
    let minAB = 90; 
    let maxAB = 255;
    let a = Math.floor(Math.random() * (maxAB - minAB + 1)) + minAB;
    let b = Math.floor(Math.random() * (maxAB - minAB + 1)) + minAB;
    let c = s - a - b;
    if (c > 255) {
        let excedente = c - 255;
        b = excedente + b;
        if (b > 255) {
            let otroExcedente = b - 255;
            a = otroExcedente + a;
        }
    }
    let colorClaro = [a, b, c];
    return colorClaro
}

function oscurecerColor(colorClaro) {
    let [a, b, c] = colorClaro;
    let factorOscurecimiento = 0.5;
    let sumaMaxima = 150;

    while (factorOscurecimiento > 0) {
        let newA = Math.round(a * factorOscurecimiento);
        let newB = Math.round(b * factorOscurecimiento);
        let newC = Math.round(c * factorOscurecimiento);
        let colorOscuro = [newA, newB, newC];
        let s = newA + newB + newC;

        if (s <= sumaMaxima) {
            return colorOscuro;
        } 
        factorOscurecimiento = factorOscurecimiento - 0.01;
    }
    return [0, 0, 0];
}

function convertirHexa(colorClaro, colorOscuro) {
    let partesHexaClaro = [];
    for (let numero of colorClaro) {
        let parteHexa = numero.toString(16); 

        if (parteHexa.length === 1) {
            parteHexa = "0" + parteHexa; 
        }
        partesHexaClaro.push(parteHexa);
    }
    let partesHexaOscuro = [];
    for (let numero of colorOscuro) {
        let parteHexa2 = numero.toString(16);
        if (parteHexa2.length === 1) {
            parteHexa2 = "0" + parteHexa2;
        }
        partesHexaOscuro.push(parteHexa2);
    }
    let hexaClaro = "#" + partesHexaClaro.join("");
    let hexaOscuro = "#" + partesHexaOscuro.join("");
    return [hexaClaro, hexaOscuro];
}