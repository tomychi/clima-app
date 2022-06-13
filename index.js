require('dotenv').config();

const {
    inquirerMenu,
    pause,
    leerInput,
    listarLugares,
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
    const busquedas = new Busquedas();
    let opt;

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // mostrar mensaje
                const termino = await leerInput('Ingrese una Ciudad: ');

                // buscar las ciudades
                const lugares = await busquedas.ciudad(termino);

                // seleccionar el lugar
                const id = await listarLugares(lugares);
                if (id === '0') continue;

                const lugarSelect = lugares.find((lugar) => lugar.id === id);

                // Guardar en DB
                busquedas.guardarHistorial(lugarSelect.nombre);

                const { nombre, lat, lng } = lugarSelect;

                // clima

                const clima = await busquedas.clima(lat, lng);
                const { desc, min, max, temp } = clima;
                // mostrar resultados
                console.log('\ninformacion de la ciudad \n'.green);
                console.log('Ciudad:', nombre);
                console.log('Lat:', lat);
                console.log('Lng:', lng);
                console.log('descripcion:', desc);
                console.log('Temperatura:', temp);
                console.log('Minima:', min);
                console.log('Maxima:', max);

                break;

            case 2:
                // mostrar historial
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${lugar}`);
                });
        }

        if (opt !== 0) await pause();
    } while (opt !== 0);
};

main();
