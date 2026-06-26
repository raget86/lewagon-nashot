const csvUrlProductos = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=0&single=true&output=csv`;

function limpiarProducto(texto) {
    return String(texto || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function cargarProductos(continenteFiltro) {
    try {
        const respuesta = await fetch(csvUrlProductos);
        const datosCsv = await respuesta.text();

        const parseResult = Papa.parse(datosCsv, { header: true, skipEmptyLines: true });
        const contenedor = document.querySelector('.products-container');
        contenedor.innerHTML = '';

        let contador = 1;

        parseResult.data.forEach((fila) => {
            const continente = limpiarProducto(fila['CONTINENTE'] || '');
            const pais = fila['PAIS'] || '';
            const contribuyente = fila['CONTRIBUYENTE'] || '';
            const foto = (fila['FOTO'] || '').trim().replace(/\u00A0/g, '');
            const fecha = fila['FECHA'] || '';
            const año = fecha.includes('/') ? fecha.split('/').pop().trim() : fecha.trim();

            let fotoFinal;
            if (foto.length > 0) {
                fotoFinal = foto;
            } else if (contribuyente) {
                fotoFinal = 'images/shots/default/tbd.png';
            } else {
                fotoFinal = 'images/shots/default/not-found.png';
            }

            let detalle;
            if (fecha) {
                detalle = `${contribuyente} - ${año}`;
            } else if (contribuyente) {
                detalle = contribuyente;
            } else {
                detalle = '';
            }

            if (continente !== limpiarProducto(continenteFiltro)) return;
            if (!pais) return;

            const div = document.createElement('div');
            div.className = 'product';
            if (fotoFinal === 'images/shots/default/not-found.png') {
                div.classList.add('no-hover');
                }
            div.setAttribute('data-name', `p-${contador}`);
            div.innerHTML = `
                <img src="${fotoFinal}" alt="${pais}">
                <h3>${pais}</h3>
                <p class="card-flip-description">${detalle}</p>
            `;
            contenedor.appendChild(div);
            contador++;
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }


}