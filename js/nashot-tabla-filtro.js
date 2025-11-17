// URL de tu CSV de Google Sheets
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=0&single=true&output=csv';
    const contenedorDatos = document.getElementById('contenedor-datos');

    // Nombres de columna ESPERADOS
    const COLUMNA_CONTINENTE = 'CONTINENTE';
    const COLUMNA_PAIS = 'PAIS';
    const COLUMNA_STATUS = 'STATUS';
    
    const COLUMNS_PER_ROW = 4; 
    let datosAgrupadosGlobal = {}; 
    
    // ⭐ VARIABLE GLOBAL PARA CONTROLAR LA ESTABILIDAD
    let currentLayoutMode = ''; 


    // FUNCIÓN OPTIMIZADA: Determina las filas para el cálculo vertical.
    function getRowsForRendering(totalPaises) {
        if (window.innerWidth < 768) {
            return totalPaises; 
        } 
        else if (window.innerWidth < 1024) {
             return Math.ceil(totalPaises / 3); 
        }
        else {
             return Math.ceil(totalPaises / COLUMNS_PER_ROW); 
        }
    }


    // Funciones auxiliares
    async function cargarYMostrarDatos() {
        try {
            contenedorDatos.innerHTML = '<div class="loading-spinner"></div>';
            
            const response = await fetch(CSV_URL);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.statusText}`);
            }
            const csvText = await response.text();

            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const datos = results.data;
                    
                    if (datos.length === 0) {
                        contenedorDatos.innerHTML = `<p style="color: orange;">⚠️ El archivo CSV está accesible, pero no contiene datos.</p>`;
                        return;
                    }

                    datosAgrupadosGlobal = datos.reduce((acumulador, fila) => {
                        const continente = fila[COLUMNA_CONTINENTE] || 'Sin Continente'; 
                        if (!acumulador[continente]) {
                            acumulador[continente] = [];
                        }
                        acumulador[continente].push(fila);
                        return acumulador;
                    }, {});

                    generarTablas(datosAgrupadosGlobal);
                    inicializarAcordeon(); 
                }
            });

        } catch (error) {
            contenedorDatos.innerHTML = `<p style="color: red;">⚠️ Error al cargar los datos: ${error.message}.</p>`;
            console.error("Error en cargarYMostrarDatos:", error);
        }
    }

    function agregarCelda(row, text) {
        const celda = row.insertCell();
        celda.textContent = text;
    }

    function agregarCeldaStatus(row, statusTextOriginal) {
        let statusText;
        
        if (statusTextOriginal === undefined) {
             statusText = '';
        } else {
            statusText = statusTextOriginal || 'Pendiente'; 
        }

        const celdaStatus = row.insertCell();
        celdaStatus.textContent = statusText;
        
        if (statusText && statusText.toLowerCase() === 'ok') {
            celdaStatus.classList.add('status-ok');
        } else if (statusText && statusText.toLowerCase() === 'pendiente') {
            celdaStatus.classList.add('status-pendiente');
        }
    }


    function generarTablas(agrupados, filtroTexto = '') {
        if (window.innerWidth < 768) {
            currentLayoutMode = 'mobile';
        } else if (window.innerWidth < 1024) {
            currentLayoutMode = 'tablet';
        } else {
            currentLayoutMode = 'desktop';
        }

        contenedorDatos.innerHTML = ''; 
        
        const continentesOrdenados = Object.keys(agrupados).sort();
        const filtroRegex = filtroTexto ? new RegExp(filtroTexto, 'i') : null;
        let resultadosEncontrados = false;

        continentesOrdenados.forEach(continente => {
            let paisesOriginal = agrupados[continente];
            
            let paisesFiltrados = paisesOriginal;
            if (filtroRegex) {
                paisesFiltrados = paisesOriginal.filter(pais => {
                    const nombrePais = pais[COLUMNA_PAIS] || '';
                    return nombrePais.match(filtroRegex);
                });
            }

            if (paisesFiltrados.length === 0) {
                return; 
            }
            
            resultadosEncontrados = true; 
            
            const countOk = paisesFiltrados.filter(pais => 
                (pais[COLUMNA_STATUS] && pais[COLUMNA_STATUS].toLowerCase() === 'ok')
            ).length;
            const totalPaises = paisesFiltrados.length;
            
            paisesFiltrados.sort((a, b) => {
                const nombreA = a[COLUMNA_PAIS] ? a[COLUMNA_PAIS].toUpperCase() : '';
                const nombreB = b[COLUMNA_PAIS] ? b[COLUMNA_PAIS].toUpperCase() : '';
                
                if (nombreA < nombreB) return -1;
                if (nombreA > nombreB) return 1;
                return 0;
            });
            
            // --- INICIO DE ESTRUCTURA DEL ACORDEÓN ---
            
            const divAcordeon = document.createElement('div');
            divAcordeon.className = 'contenedor-acordeon';
            
            const header = document.createElement('button');
            header.className = 'acordeon-header';
            
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'acordeon-title-wrapper';
            titleWrapper.textContent = continente; 
            
            const countSpan = document.createElement('span');
            countSpan.innerHTML = `(${countOk}/${totalPaises} países)`;
            titleWrapper.appendChild(countSpan);
            
            header.appendChild(titleWrapper); 
            
            const content = document.createElement('div');
            content.className = 'acordeon-content';
            
            // 4. Generación de la tabla
            const tabla = document.createElement('table');
            const thead = tabla.createTHead();
            const headerRow = thead.insertRow();
            for(let k = 0; k < COLUMNS_PER_ROW; k++) {
                ['País', 'Status'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
            }
            
            const tbody = tabla.createTBody();
            
            const rows = getRowsForRendering(totalPaises); 

            for (let i = 0; i < rows; i++) {
                const row = tbody.insertRow();
                
                for (let j = 0; j < COLUMNS_PER_ROW; j++) {
                    const index = i + (j * rows); 
                    const pais = paisesFiltrados[index]; 
                    
                    if (pais) {
                        agregarCelda(row, pais[COLUMNA_PAIS] || '');
                        agregarCeldaStatus(row, pais[COLUMNA_STATUS]); 
                    } else {
                        agregarCelda(row, '');
                        agregarCeldaStatus(row, undefined); 
                    }
                }
            }
            
            // Adjuntar elementos
            content.appendChild(tabla);
            divAcordeon.appendChild(header);
            divAcordeon.appendChild(content);
            contenedorDatos.appendChild(divAcordeon);

            if (filtroRegex) {
                // Si hay filtro, se expande para mostrar el resultado
                header.classList.add('active');
                content.classList.add('show');
            }
            // ⭐ NO SE HACE NADA AQUÍ SI NO HAY FILTRO: por defecto queda cerrado.
        });

        if (!resultadosEncontrados && filtroTexto) {
             contenedorDatos.innerHTML = `<p style="color: red; padding: 20px; font-weight: bold;">❌ No se encontraron países que coincidan con "${filtroTexto}".</p>`;
        }
    }
    
    
    // FUNCIÓN FILTRAR OPTIMIZADA: usa debounce
    let debounceTimer;
    function filtrarPaises() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const textoFiltro = document.getElementById('filtro-pais').value.trim();
            generarTablas(datosAgrupadosGlobal, textoFiltro);
            inicializarAcordeon();
        }, 250); 
    }


    // Lógica de JavaScript para el acordeón 
    function inicializarAcordeon() {
        window.removeEventListener('resize', resizeHandler); 
        window.addEventListener('resize', resizeHandler);
        
        const headers = document.querySelectorAll('.acordeon-header');

        headers.forEach(header => {
            header.removeEventListener('click', toggleAcordeon);
            header.addEventListener('click', toggleAcordeon);

            // ⭐ CAMBIO CLAVE: Eliminar la lógica de expansión del primer elemento.
            // La expansión solo ocurre si hay un filtro aplicado, lo cual se maneja en generarTablas.
            // Aquí solo nos aseguramos de que no queden activos si el filtro se borra.
            const isFiltered = document.getElementById('filtro-pais').value.trim();

            if (!isFiltered) {
                 header.classList.remove('active');
                 header.nextElementSibling.classList.remove('show');
            }
        });
    }

    let resizeTimer;
    function resizeHandler() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (Object.keys(datosAgrupadosGlobal).length > 0) {
                const newMode = (window.innerWidth < 768) ? 'mobile' : (window.innerWidth < 1024) ? 'tablet' : 'desktop';
                
                if (newMode !== currentLayoutMode) {
                    const filtroTexto = document.getElementById('filtro-pais').value.trim();
                    generarTablas(datosAgrupadosGlobal, filtroTexto);
                    inicializarAcordeon(); 
                }
            }
        }, 250); 
    }
    
    function toggleAcordeon() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        content.classList.toggle('show');
    }

    // Ejecutar la función al cargar la página
    cargarYMostrarDatos();
