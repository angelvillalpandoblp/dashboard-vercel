document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
});

function checkBackendStatus() {
    try {
        // Buscamos los elementos con precaución
        const indicator = document.querySelector('.status-indicator') || document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-title');

        if (indicator) {
            indicator.classList.add('online');
        }
        if (statusText) {
            statusText.textContent = "Sistema Activo";
        }
    } catch (error) {
        // Si algo falla, lo silenciamos para que no bloquee los clics
        console.warn("Estado del sistema: Elementos de UI no encontrados.");
    }
}   

/**
 * Control de la Barra Lateral (Sidebar)
 */
function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
    // Forzar el redibujado de los iframes para que se ajusten al nuevo ancho
    window.dispatchEvent(new Event('resize'));
}

/**
 * Navegación entre pestañas con animación de entrada
 */
function navigate(viewId, btn) {
    // 1. Ocultar todas las secciones y resetear su estado de animación
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // 2. Mostrar la sección destino
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.style.display = 'block';
        // Forzar un "reflow" para que el navegador reinicie la animación
        void targetView.offsetWidth; 
        targetView.classList.add('active');
    }

    // 3. Gestionar botones del menú
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    btn.classList.add('active');

    // 4. Actualizar título de la página
    document.getElementById('page-title').textContent = btn.innerText;

    // 5. Notificar a las gráficas que se ajusten
    window.dispatchEvent(new Event('resize'));
}

/**
 * Carga de datos para la tabla de Incidencias desde Google Sheets
 */
function loadData() {
    const url = "https://docs.google.com/spreadsheets/d/1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0/export?format=csv&gid=1298177878";
    Papa.parse(url, {
        download: true,
        complete: function(results) {
            const data = results.data;
            const thead = document.getElementById('table-header');
            const tbody = document.getElementById('table-body');
            if (!thead || !tbody) return;

            thead.innerHTML = ""; 
            tbody.innerHTML = "";

            if (data.length > 0) {
                const hRow = document.createElement('tr');
                data[0].forEach(t => { 
                    const th = document.createElement('th'); 
                    th.textContent = t; 
                    hRow.appendChild(th); 
                });
                thead.appendChild(hRow);

                data.slice(1).forEach(row => {
                    if(!row.join('').trim()) return;
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        const td = document.createElement('td');
                        if(cell.toLowerCase().includes("perdido") || cell.toLowerCase().includes("faltante")) {
                            td.innerHTML = `<span class="badge-alert">${cell}</span>`;
                        } else { 
                            td.textContent = cell || "-"; 
                        }
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
            }
       
        }
    });
}

/**
 * Filtro de búsqueda para la tabla de Incidencias
 */
function filterTable() {
    const val = document.getElementById("toolSearch").value.toUpperCase();
    const rows = document.getElementById("table-body").getElementsByTagName("tr");
    for (let r of rows) { 
        r.style.display = r.textContent.toUpperCase().includes(val) ? "" : "none"; 
    }
}

/**
 * Abre la tabla modal para una Gaveta específica
 */
function openGavetaTable(gid, title) {
    const modal = document.getElementById('tableModal');
    const header = document.getElementById('gaveta-header');
    const body = document.getElementById('gaveta-body');
    const modalTitle = document.getElementById('modalTitle');

    if (!modal) return;

    modal.style.display = 'flex';
    modalTitle.textContent = title + " . Semana 7";
    header.innerHTML = "";
    body.innerHTML = "<tr><td colspan='10' style='text-align:center; padding:40px;'>Cargando...</td></tr>";

    const spreadsheetID = "1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0";
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/export?format=csv&gid=${gid}`;

    Papa.parse(url, {
        download: true,
        complete: function(results) {
            const data = results.data;
            header.innerHTML = "";
            body.innerHTML = "";
            if (data.length > 0) {
                const trH = document.createElement('tr');
                data[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.textContent = cell;
                    trH.appendChild(th);
                });
                header.appendChild(trH);

                data.slice(1).forEach(row => {
                    if(!row.join('').trim()) return;
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell || "-";
                        tr.appendChild(td);
                    });
                    body.appendChild(tr);
                });
            }
        }
    });
}

/**
 * Cierra la ventana modal
 */
function closeModal() {
    const modal = document.getElementById('tableModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Inicialización Global al cargar la página
 */
window.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    loadData();
    loadRefaccionesData();
    
    // Crear iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Establecer fecha actual
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date());
    }
});

/**
 * Cerrar modal al hacer clic fuera del contenido
 */
window.onclick = function(event) {
    const modal = document.getElementById('tableModal');
    if (event.target == modal) {
        closeModal();
    }
};

/**
 * Carga de datos para la pestaña de Refacciones
 */
function loadRefaccionesData() {
    const gid = "1724200568"; 
    const spreadsheetID = "1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0";
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/export?format=csv&gid=${gid}`;

    Papa.parse(url, {
        download: true,
        complete: function(results) {
            const data = results.data;
            const thead = document.getElementById('refacciones-header');
            const tbody = document.getElementById('refacciones-body');
            
            if (!thead || !tbody) return;
            thead.innerHTML = ""; tbody.innerHTML = "";

            if (data.length > 0) {
                const hRow = document.createElement('tr');
                data[0].forEach(t => {
                    const th = document.createElement('th');
                    th.textContent = t;
                    hRow.appendChild(th);
                });
                thead.appendChild(hRow);

                // MODIFICACIÓN AQUÍ: Añadimos (row, index) para saber qué fila se toca
                data.slice(1).forEach((row, index) => {
                    if(!row.join('').trim()) return;
                    const tr = document.createElement('tr');
                    
                    // Hacer la fila clickeable
                    tr.style.cursor = "pointer";
                    tr.onclick = function() {
                        openImageModal(index, row[0]); // Pasa el índice y el nombre de la refacción
                    };

                    row.forEach(cell => {
                        const td = document.createElement('td');
                        const text = cell || "-";
                        
                        const lowerText = text.toLowerCase();
                        if(lowerText.includes("bajo") || lowerText.includes("agotado")) {
                            td.innerHTML = `<span class="badge-alert">${text}</span>`;
                        } else if(lowerText.includes("ok") || lowerText.includes("disponible")) {
                            td.innerHTML = `<span style="background:#DCFCE7; color:#16A34A; padding:5px 10px; border-radius:6px; font-weight:700;">${text}</span>`;
                        } else {
                            td.textContent = text;
                        }
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
            }
        }
    });
}

/**
 * Filtro de búsqueda para Refacciones
 */
function filterRefaccionesTable() {
    const val = document.getElementById("refaccionesSearch").value.toUpperCase();
    const rows = document.getElementById("refacciones-body").getElementsByTagName("tr");
    for (let r of rows) {
        r.style.display = r.textContent.toUpperCase().includes(val) ? "" : "none";
    }
}

// ARRAY DE FOTOS (Asegúrate de poner los links de compartir de Drive)
const fotosRefacciones = [
    "https://drive.google.com/file/d/1Ou-u-XKSjMxCW6xQmuZCUbHbZ0DL4ldI/view?usp=sharing",
    "https://drive.google.com/file/d/1USQyUjwQ5RSHz0tMSQ6l8UqrT8n7FL4G/view?usp=sharing",
];

/**
 * Convierte link de Drive a link de visualización directa
 */
function fixDriveUrl(url) {
    if (url.includes('drive.google.com')) {
        const id = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return url;
}

function openImageModal(index, nombre) {
    const modal = document.getElementById('imageModal');
    const imgTag = document.getElementById('refaccionImg');
    const title = document.getElementById('imageModalTitle');

    if (!modal || !imgTag) return;

    const rawUrl = fotosRefacciones[index];

    if (rawUrl) {
        const match = rawUrl.match(/\/d\/(.+?)\//);
        
        if (match && match[1]) {
            const id = match[1];
            
            // 2. USAR EL LINK DE THUMBNAIL (Más estable para mostrar en webs)
            // El parámetro &sz=w1000 le pide a Google una calidad de 1000px
            imgTag.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            
            title.textContent = nombre;
            modal.style.display = 'flex';
            
            // Log para que verifiques en la consola (F12) que el ID sea correcto
            console.log("Mostrando imagen de Drive ID:", id);

            if (window.lucide) lucide.createIcons();
        } else {
            alert("Error: El formato del link de Drive no es correcto.");
        }
    } else {
        alert("No hay imagen disponible para esta posición.");
    }
}
function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.getElementById('refaccionImg').src = ""; // Limpiar para la próxima
}

// Actualiza tu window.onclick para que también cierre este modal
window.onclick = function(e) {
    const tableModal = document.getElementById('tableModal');
    const imageModal = document.getElementById('imageModal');
    if(e.target == tableModal) closeModal();
    if(e.target == imageModal) closeImageModal();
}