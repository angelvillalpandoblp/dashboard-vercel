document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const result = await response.json();

        if (result.status === 'success') {
            // Actualizar tarjetas
            document.getElementById('total-items').textContent = result.metrics.total;
            document.getElementById('total-missing').textContent = result.metrics.faltantes;

            // Renderizar tabla (igual que antes)
            renderTable(result.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderTable(records) {
    const tbody = document.querySelector('#tools-table tbody');
    tbody.innerHTML = '';

    records.forEach(item => {
        const tr = document.createElement('tr');
        // Ajusta los nombres de las propiedades según las columnas de tu CSV
        // Si tu columna en Excel es "Nombre Herramienta", en JS será item['Nombre Herramienta']
        const estado = item.Estado || 'Desconocido';
        const estadoClass = estado === 'Faltante' ? 'status-missing' : 'status-ok';
        
        tr.innerHTML = `
            <td>${item.Herramienta}</td>
            <td>${item.Categoria}</td>
            <td><span class="status-badge ${estadoClass}">${estado}</span></td>
            <td>${item.Responsable}</td>
        `;
        tbody.appendChild(tr);
    });
}