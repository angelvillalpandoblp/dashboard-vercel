document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
});

async function checkBackendStatus() {
    const statusDiv = document.getElementById('api-status');
    const dot = statusDiv.querySelector('.dot');
    const textNode = statusDiv.lastChild;

    try {
        // CAMBIO IMPORTANTE: Ahora apuntamos directamente al archivo
        const response = await fetch('/api/index'); 
        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.classList.add('online');
            dot.style.backgroundColor = '#10b981';
            textNode.textContent = ' Conectado (' + data.registros + ' items)';
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error(error);
        statusDiv.classList.add('offline');
        dot.style.backgroundColor = '#ef4444';
        textNode.textContent = ' Sin conexión con Python';
    }
}

function openGavetaTable(gid, title) {
    const modal = document.getElementById('tableModal');
    const header = document.getElementById('gaveta-header');
    const body = document.getElementById('gaveta-body');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = "Contenido Detallado: " + title;
    header.innerHTML = "";
    body.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:40px;'>Cargando inventario...</td></tr>";
    
    modal.style.display = 'flex';

    // Llamamos a la pestaña específica usando el GID
    const spreadsheetID = "1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0";
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/export?format=csv&gid=${gid}`;

    Papa.parse(url, {
        download: true,
        complete: function(results) {
            const data = results.data;
            header.innerHTML = "";
            body.innerHTML = "";

            if (data.length > 0) {
                // Crear cabecera de la tabla
                const trH = document.createElement('tr');
                data[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.textContent = cell;
                    trH.appendChild(th);
                });
                header.appendChild(trH);

                // Crear filas
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

function closeModal() {
    document.getElementById('tableModal').style.display = 'none';
}

// Cerrar al hacer clic fuera del cuadro blanco
window.onclick = function(event) {
    if (event.target == document.getElementById('tableModal')) closeModal();
}