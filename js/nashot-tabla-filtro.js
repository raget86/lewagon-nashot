
    // URL de tu CSV de Google Sheets
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=0&single=true&output=csv';
    const contenedorDatos = document.getElementById('contenedor-datos');

    // Nombres de columna ESPERADOS
    const COLUMNA_CONTINENTE = 'CONTINENTE';
    const COLUMNA_PAIS = 'PAÍS';
    const COLUMNA_STATUS = 'STATUS';
    
    const COLUMNS_PER_ROW = 4; 
    let datosAgrupadosGlobal = {}; 


    // ⭐ FUNCIÓN CORREGIDA: Determina las filas para el cálculo vertical.
    function getRowsForRendering(totalPaises) {
        // Móvil (< 768px): 1 columna visible. Lista completa.
        if (window.innerWidth < 768) {
            return totalPaises; 
        } 
        // Tablet (768px a 1024px): 3 columnas visibles.
        else if (window.innerWidth < 1024) {
             return Math.ceil(totalPaises / 3); // CÁLCULO CLAVE: Usamos 3 columnas
        }
        // Escritorio (>= 1024px): 4 columnas visibles.
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
        
        // Si no hay valor (es decir, la celda fue llamada sin datos), ponemos ''
        if (statusTextOriginal === undefined) {
             statusText = '';
        } else {
            // Si el status es nulo/vacío, se reemplaza por "Pendiente"
            statusText = statusTextOriginal || 'Pendiente'; 
        }

        const celdaStatus = row.insertCell();
        celdaStatus.textContent = statusText;
        
        // Aplicar estilos
        if (statusText && statusText.toLowerCase() === 'ok') {
            celdaStatus.classList.add('status-ok');
        } else if (statusText && statusText.toLowerCase() === 'pendiente') {
            celdaStatus.classList.add('status-pendiente');
        }
    }


    // Función principal para generar las tablas
    function generarTablas(agrupados, filtroTexto = '') {
        contenedorDatos.innerHTML = ''; 
        
        const continentesOrdenados = Object.keys(agrupados).sort();
        const filtroRegex = filtroTexto ? new RegExp(filtroTexto, 'i') : null;
        let resultadosEncontrados = false;

        continentesOrdenados.forEach(continente => {
            let paisesOriginal = agrupados[continente];
            
            // 1. Filtrar los países. 
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
            
            // 2. Contar países con status 'OK'
            const countOk = paisesFiltrados.filter(pais => 
                (pais[COLUMNA_STATUS] && pais[COLUMNA_STATUS].toLowerCase() === 'ok')
            ).length;
            const totalPaises = paisesFiltrados.length;
            
            // 3. Ordenar la lista ALFABÉTICAMENTE
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
            
            // ⭐ APLICACIÓN CLAVE: Usar la lógica de cálculo adaptativa
            const rows = getRowsForRendering(totalPaises); 

            // El bucle principal iterará el número de filas determinado por getRowsForRendering
            for (let i = 0; i < rows; i++) {
                const row = tbody.insertRow();
                
                for (let j = 0; j < COLUMNS_PER_ROW; j++) {
                    // Calculamos el índice vertical
                    const index = i + (j * rows); 
                    const pais = paisesFiltrados[index]; 
                    
                    if (pais) {
                        agregarCelda(row, pais[COLUMNA_PAIS] || '');
                        agregarCeldaStatus(row, pais[COLUMNA_STATUS]); // Pasa el status original
                    } else {
                        // Sin país: El status se pasa como undefined para que la función lo maneje como placeholder
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
                header.classList.add('active');
                content.classList.add('show');
            }
        });

        if (!resultadosEncontrados && filtroTexto) {
             contenedorDatos.innerHTML = `<p style="color: red; padding: 20px; font-weight: bold;">❌ No se encontraron países que coincidan con "${filtroTexto}".</p>`;
        }
    }
    
    
    // ⭐ FUNCIÓN FILTRAR OPTIMIZADA: usa debounce
    let debounceTimer;
    function filtrarPaises() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const textoFiltro = document.getElementById('filtro-pais').value.trim();
            generarTablas(datosAgrupadosGlobal, textoFiltro);
            inicializarAcordeon();
        }, 250); // Espera 250ms después de la última tecla para regenerar
    }


    // Lógica de JavaScript para el acordeón 
    function inicializarAcordeon() {
        // OPTIMIZACIÓN: Añadir el debounce para el resize
        window.removeEventListener('resize', resizeHandler); // Limpia el listener anterior
        window.addEventListener('resize', resizeHandler);
        
        const headers = document.querySelectorAll('.acordeon-header');

        headers.forEach(header => {
            header.removeEventListener('click', toggleAcordeon);
            header.addEventListener('click', toggleAcordeon);

            const isFirst = header === headers[0];
            const isFiltered = document.getElementById('filtro-pais').value.trim();

            if (isFiltered) {
                // Ya expandido
            } else if (isFirst) {
                header.classList.add('active');
                header.nextElementSibling.classList.add('show');
            } else {
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
                const filtroTexto = document.getElementById('filtro-pais').value.trim();
                generarTablas(datosAgrupadosGlobal, filtroTexto);
                inicializarAcordeon(); // Es necesario reinicializar el acordeón para que funcione el clic después del renderizado.
            }
        }, 250); // Espera 250ms para regenerar después de redimensionar
    }
    
    function toggleAcordeon() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        content.classList.toggle('show');
    }

    // Ejecutar la función al cargar la página
    cargarYMostrarDatos();
