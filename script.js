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


