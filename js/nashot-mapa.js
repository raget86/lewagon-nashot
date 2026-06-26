const csvUrlMapa = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=0&single=true&output=csv`;

async function iniciarMapa() {
    // Initialize map
    const mapa = L.map('mapa-container', {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false
    });

    // Base tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(mapa);

    // Fetch your CSV
    const respuesta = await fetch(csvUrlMapa);
    const datosCsv = await respuesta.text();
    const parseResult = Papa.parse(datosCsv, { header: true, skipEmptyLines: true });

    // Build lookup of ISO2 → { status, pais }
    const paisesStatus = {};
    parseResult.data.forEach(fila => {
        const iso = (fila['ISO 2'] || '').trim().toUpperCase();
        const status = (fila['STATUS'] || '').trim().toLowerCase();
        const pais = (fila['PAIS'] || '').trim();
        if (iso) paisesStatus[iso] = { status, pais };
    });

    // Fetch world GeoJSON
    const geoResp = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geoData = await geoResp.json();

    // GeoJSON layer
    L.geoJSON(geoData, {
        style: (feature) => {
            const iso = feature.properties['ISO3166-1-Alpha-2'];
            const data = paisesStatus[iso];
            const isOk = data && data.status === 'ok';
            return {
                fillColor: isOk ? '#0097a7' : '#bcdefa',
                fillOpacity: isOk ? 0.8 : 0.4,
                color: '#158591',
                weight: 0.5
            };
        },
        onEachFeature: (feature, layer) => {
    const iso = feature.properties['ISO3166-1-Alpha-2'];
    const data = paisesStatus[iso];
    const isOk = data && data.status === 'ok';

    if (isOk) {
        layer.on('mouseover', () => {
            layer.setStyle({ fillColor: '#006978', fillOpacity: 1 });
        });
        layer.on('mouseout', () => {
            layer.setStyle({ fillColor: '#0097a7', fillOpacity: 0.8 });
        });
    }

    // Tooltip for ALL countries
    const nombre = data ? data.pais : feature.properties.name;
    layer.bindTooltip(nombre, {
        sticky: true,
        className: isOk ? 'mapa-tooltip' : 'mapa-tooltip-pendiente'
    });
}


    }).addTo(mapa);
}

window.addEventListener('DOMContentLoaded', () => {
    iniciarMapa();
});