        // *** ENLACE ACTUALIZADO ***
        // URL de tu hoja de cálculo publicada (versión nueva)
        const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=0&single=true&output=csv";
        
        // Usamos un 'proxy' para evitar el error de CORS.
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const csvUrl = proxyUrl + encodeURIComponent(googleSheetUrl);

        window.addEventListener('DOMContentLoaded', () => {
            cargarDatos();
        });

        async function cargarDatos() {
            try {
                const respuesta = await fetch(csvUrl);
                if (!respuesta.ok) {
                    throw new Error('No se pudo cargar la hoja de cálculo');
                }
                
                const datosCsv = await respuesta.text();
                
                // Procesar el CSV
                const filas = datosCsv.trim().split('\n');
                
                // Quitar y procesar la fila de encabezados (la primera fila)
                const encabezadosTexto = filas.shift(); 
                if (!encabezadosTexto) {
                    throw new Error('El CSV está vacío o no tiene encabezados.');
                }
                const encabezados = encabezadosTexto.trim().split(',');

                // Encontrar los números de columna para 'PAÍS' y 'STATUS'
                const indicePais = encabezados.indexOf('PAÍS');
                const indiceStatus = encabezados.indexOf('STATUS');

                if (indicePais === -1) {
                    throw new Error('No se encontró la columna "PAÍS"');
                }
                if (indiceStatus === -1) {
                    throw new Error('No se encontró la columna "STATUS"');
                }

                let totalPaises = 0;
                let paisesReunidos = 0;

                // Contar las filas (el array 'filas' YA NO CONTIENE el encabezado)
                filas.forEach(fila => {
                    const filaLimpia = fila.trim();
                    // Ignorar filas vacías
                    if (filaLimpia === '') {
                        return;
                    }

                    const columnas = filaLimpia.split(',');
                    
                    // Contamos si la columna PAÍS tiene algo
                    if (columnas.length > indicePais && columnas[indicePais] && columnas[indicePais].trim() !== '') {
                        totalPaises++;
                    }
                    
                    // Contamos si la columna STATUS tiene algo
                    if (columnas.length > indiceStatus && columnas[indiceStatus] && columnas[indiceStatus].trim() !== '') {
                        paisesReunidos++;
                    }
                });

                // Calcular el porcentaje
                const porcentaje = (totalPaises > 0) ? (paisesReunidos / totalPaises) * 100 : 0;

                // **** ¡LA CORRECCIÓN ESTÁ AQUÍ! ****
                // Esta línea define la variable que faltaba en tu código
                const porcentajeTexto = porcentaje.toFixed(1) + '%';

                // Actualizar el HTML
                document.getElementById('total-paises').textContent = totalPaises;
                document.getElementById('paises-reunidos').textContent = paisesReunidos;
                document.getElementById('porcentaje-progreso').textContent = porcentajeTexto;
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('total-paises').textContent = 'Error';
                document.getElementById('paises-reunidos').textContent = 'Error';
                document.getElementById('porcentaje-progreso').textContent = 'Error';
            }
        }
