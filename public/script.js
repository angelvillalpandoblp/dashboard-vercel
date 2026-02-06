document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
});

async function checkBackendStatus() {
    const statusDiv = document.getElementById('api-status');
    const dot = statusDiv.querySelector('.dot');
    const textNode = statusDiv.lastChild; // El texto después del punto

    try {
        // Llamamos a Python solo para verificar estado
        const response = await fetch('/api/data');
        const data = await response.json();

        if (data.status === 'success') {
            statusDiv.classList.add('online');
            dot.style.backgroundColor = '#10b981'; // Verde
            textNode.textContent = ' Sistema Online • ' + data.total_registros_procesados + ' registros analizados';
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        statusDiv.classList.add('offline');
        dot.style.backgroundColor = '#ef4444'; // Rojo
        textNode.textContent = ' Error de conexión con servidor';
    }
}