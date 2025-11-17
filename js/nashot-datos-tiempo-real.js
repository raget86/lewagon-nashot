// URL de tu hoja de cálculo publicada (versión nueva)
const googleSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTIONazFmwW5mMTlPn0mJJGis7MT3__hiG_D8redxOviy56l9nDsXNBiX_Yts_vxyUWoyow_UoFlKZs/pub?gid=0&single=true&output=csv";

// Usamos un 'proxy' para evitar el error de CORS.
const proxyUrl = "https://api.allorigins.win/raw?url=";
const csvUrl = proxyUrl + encodeURIComponent(googleSheetUrl);

window.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

// Función para limpiar una cadena de texto (quita tildes, espacios extra, y convierte a minúsculas).
function limpiarTexto(texto) {
    if (!texto) return '';
    // 1. Quita espacios al inicio/final. 2. Convierte a minúsculas. 3. Quita tildes.
    return String(texto).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

async function cargarDatos() {
    try {
        const respuesta = await fetch(csvUrl);
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar la hoja de cálculo');
        }

        const datosCsv = await respuesta.text();

        // 🚨 USO DE PAPA PARSE: Más robusto para CSV.
        const parseResult = Papa.parse(datosCsv, {
            header: true, // Convierte la primera fila en nombres de objeto
            skipEmptyLines: true,
            // Nota: Papa Parse es sensible a los nombres de las columnas, si tu columna es 'País' 
            // la clave será 'País' (con P mayúscula y tilde).
        });

        if (parseResult.errors.length > 0) {
            console.error('Errores de Papa Parse:', parseResult.errors);
            throw new Error('Error al procesar el CSV. Revise los datos.');
        }

        let totalPaises = 0;
        let paisesReunidos = 0;
        
        // // 🚨 Ajustamos el valor de filtro a minúsculas y sin tildes para la comparación.
        // const CONTINENTE_A_FILTRAR = 'america'; 
        
        // Obtenemos los nombres de las columnas detectadas (para ayudarte si los nombres fallan)
        const encabezadosDetectados = parseResult.meta.fields || [];

        // 🚨 Iteramos sobre los datos
        parseResult.data.forEach(filaObjeto => {
            
            // Usamos las claves de los objetos (nombres de las columnas)
            
                
            // 1. CONTEO TOTAL DE PAÍSES (Si el campo PAÍS no está vacío)
            // ⚠️ Intenta acceder a la columna 'pais'. AJUSTA la clave si tu columna se llama diferente.
            const valorPais = filaObjeto['pais'] || filaObjeto['PAIS'] || ''; 
            if (String(valorPais).trim() !== '') {
                totalPaises++;
            }

            // 2. CONTEO DE PAÍSES REUNIDOS (Si el campo STATUS no está vacío)
            // ⚠️ Intenta acceder a la columna 'status'. AJUSTA la clave si tu columna se llama diferente.
            // Si el campo STATUS tiene un valor específico (ej: 'X' o 'Sí'), cambia '!==""' por '=== "X"'
            const valorStatus = filaObjeto['status'] || filaObjeto['STATUS'] || ''; 
            if (String(valorStatus).trim() !== '') {
                paisesReunidos++;
            }
        });

        // Calcular el porcentaje
        const porcentaje = (totalPaises > 0) ? (paisesReunidos / totalPaises) * 100 : 0;
        const porcentajeTexto = porcentaje.toFixed(1) + '%';
        
        // Actualizar el HTML
        document.getElementById('total-paises').textContent = totalPaises;
        document.getElementById('paises-reunidos').textContent = paisesReunidos;
        document.getElementById('porcentaje-progreso').textContent = porcentajeTexto;

        console.log("-----------------------------------------");
        console.log(`🔎 Encabezados detectados por Papa Parse:`, encabezadosDetectados);
        console.log(`[RESULTADO FINAL] Total Países: ${totalPaises}`);
        console.log(`[RESULTADO FINAL] Países Reunidos: ${paisesReunidos}`);
        console.log(`[RESULTADO FINAL] Porcentaje: ${porcentajeTexto}`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error('Error al cargar datos:', error);
        document.getElementById('total-paises').textContent = 'N/A';
        document.getElementById('paises-reunidos').textContent = 'N/A';
        document.getElementById('porcentaje-progreso').textContent = 'N/A';
    }
}
