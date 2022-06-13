const fs = require('fs');

const axios = require('axios');

class Busquedas {
    // fines educativos
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map((lugar) => {
            let palabras = lugar.split(' ');
            palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            access_token: process.env.MAPBOX_TOKEN,
            limit: 5,
            language: 'es',
            types: 'place',
        };
    }

    async ciudad(lugar = '') {
        try {
            // peticion http

            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox,
            });

            const resp = await intance.get();
            return resp.data.features.map((lugar) => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lat: lugar.center[1],
                lng: lugar.center[0],
            }));
        } catch (error) {
            return [];
        }
    }

    get paramsOpenWeather() {
        return {
            appid: process.env.OPEN_WEATHER_TOKEN,
            units: 'metric',
            lang: 'es',
        };
    }

    async clima(lat, lon) {
        try {
            const intance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon },
            });
            const { data } = await intance.get();
            const { weather, main } = data;
            const { temp, temp_min, temp_max } = main;
            return {
                desc: weather[0].description,
                min: temp_min,
                max: temp_max,
                temp: temp,
            };
        } catch (error) {
            console.log(error);
            return {};
        }
    }

    guardarHistorial(lugar = '') {
        // prevenir duplicados
        if (this.historial.includes(lugar.toLocaleLowerCase())) return;

        this.historial = this.historial.splice(0, 5);

        this.historial.unshift(lugar.toLocaleLowerCase());

        // guardar en DB
        this.guardarDb();
    }

    guardarDb() {
        const payload = {
            historial: this.historial,
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {
        // debe de existir el archivo
        if (!fs.existsSync(this.dbPath)) return;

        // const info
        const info = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(info);

        this.historial = data.historial;
    }
}

module.exports = Busquedas;
