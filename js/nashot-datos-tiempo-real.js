const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=192069688&single=true&output=csv`;

function limpiar(texto) {
    return String(texto || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function buscarColumna(fila, nombre) {
    const nombreLimpio = limpiar(nombre);
    const clave = Object.keys(fila).find(k => limpiar(k) === nombreLimpio);
    return clave ? fila[clave] : null;
}

async function cargarDatosContinente(nombreContinente, idPaises, idRecolectados, idPorcentaje) {
    try {
        const respuesta = await fetch(csvUrl);
        const datosCsv = await respuesta.text();
        const parseResult = Papa.parse(datosCsv, { header: true, skipEmptyLines: true });

        const fila = parseResult.data.find(f =>
            Object.values(f).some(val => limpiar(val) === limpiar(nombreContinente))
        );

        if (fila) {
            document.getElementById(idPaises).textContent      = buscarColumna(fila, 'Paises');
            document.getElementById(idRecolectados).textContent = buscarColumna(fila, 'Recolectados');
            document.getElementById(idPorcentaje).textContent  = buscarColumna(fila, 'Porcentaje');
        }

    } catch (error) {
        console.error(`Error al cargar datos ${nombreContinente}:`, error);
        document.getElementById(idPaises).textContent      = 'N/A';
        document.getElementById(idRecolectados).textContent = 'N/A';
        document.getElementById(idPorcentaje).textContent  = 'N/A';
    }
}