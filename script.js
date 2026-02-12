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
    "https://drive.google.com/file/d/1Ou-u-XKSjMxCW6xQmuZCUbHbZ0DL4ldI/view?usp=sharing",
    "https://drive.google.com/file/d/1USQyUjwQ5RSHz0tMSQ6l8UqrT8n7FL4G/view?usp=sharing",
    "https://drive.google.com/file/d/1DniJ5NHlF3OuHqRdYrnOB9ss73UVekLT/view?usp=sharing",
    "https://drive.google.com/file/d/1BKCEUEt1raPbJXjHPbwMkmGL-J-DjOcg/view?usp=sharing",
    "https://drive.google.com/file/d/1rjQf_4_0wx-s80-avcuPXwyNv1kGo1eP/view?usp=sharing",
    "https://drive.google.com/file/d/1Vv3HY7FFya_jgpg0o-wjBwbvo2OSEYS1/view?usp=sharing",
    "https://drive.google.com/file/d/19TLtABfmK3qNXw2aFXuFoCVYF3yhYuBw/view?usp=sharing",
    "https://drive.google.com/file/d/1Ra4W_KdsHUcZ2eQI7iGfrGmGtPE3LAwX/view?usp=sharing",
    "https://drive.google.com/file/d/1z5_eeGwvjt8y2GJhAEXEcyPzZ_d7HzY2/view?usp=sharing",
    "https://drive.google.com/file/d/1bk6mf5V8PSLCsgDCXLupe8winmwJ0Tfr/view?usp=sharing",
    "https://drive.google.com/file/d/11d4QQ0Cm5mBDPgLqT9K305iIAj57KyKU/view?usp=sharing",
    "https://drive.google.com/file/d/12Z3tenGV2i_Us35ylyqfx0kkvtlmXPlk/view?usp=sharing",
    "https://drive.google.com/file/d/1kj36FWocqPLD4dVflg3hX3Frm2h6KqqG/view?usp=sharing",
    "https://drive.google.com/file/d/1Txw105JEb8slsEb3pFcDxFVMrtukTQJ4/view?usp=sharing",
    "https://drive.google.com/file/d/1FryC46mZcFZ2IkMArZUKq6NWXb-8b631/view?usp=sharing",
    "https://drive.google.com/file/d/1IMbd1m3t28gzlX5npeD8_0cIQOpdApqL/view?usp=sharing",
    "https://drive.google.com/file/d/1CMcFmXJ7v9EUCh2q7QkP1g8ZnqxByeWl/view?usp=sharing",
    "https://drive.google.com/file/d/1BwanELF-pdNwWafcCNqZsb49LNglHirL/view?usp=sharing",
    "https://drive.google.com/file/d/1LmvZxPElfiZQWlTeqsE_CX8Kqx2QftrY/view?usp=sharing",
    "https://drive.google.com/file/d/1u2KQT_Mps0IR2fGS-mzTOJBmvQd2jK3S/view?usp=sharing",
    "https://drive.google.com/file/d/1DzAUp5QRvuXSUh3GXRkQXCwfVOiNoIs3/view?usp=sharing",
    "https://drive.google.com/file/d/1vluzLq85j8v-dMkg-KfL31uKPkb0zoga/view?usp=sharing",
    "https://drive.google.com/file/d/1WeZfg0eUUSCAC454klF7w5mKOYu3Ra2Y/view?usp=sharing",
    "https://drive.google.com/file/d/1Nmbfg_hbz67GgcyaUJPkVvGc01nG1jXZ/view?usp=sharing",
    "https://drive.google.com/file/d/12UxKBdPkxsHS-NHlaUMfogByHH1T_p9H/view?usp=sharing",
    "https://drive.google.com/file/d/1fZwCN4laagBwFKxKKfY3H71-qQ1Or07t/view?usp=sharing",
    "https://drive.google.com/file/d/1-g0v3m5F2zN145mxMAWDFApFgQjhGbud/view?usp=sharing",
    "https://drive.google.com/file/d/1mESbCve389Sar7BBOyictUZgTSfVCs6E/view?usp=sharing",
    "https://drive.google.com/file/d/1araSs2-yFg8iMRUnPNa0J6XR70_JYutN/view?usp=sharing",
    "https://drive.google.com/file/d/1uvCq-km_8_GMKuyM6K6WVGG80GNBS6sV/view?usp=sharing",
    "https://drive.google.com/file/d/1yrB40rrPxaeRzIS-5xacxwjQuN8tv27k/view?usp=sharing",
    "https://drive.google.com/file/d/1sBlaHS8gfjhcEhAfCa-C9WqyBOciXtvy/view?usp=sharing",
    "https://drive.google.com/file/d/1Dkk8A_R-g1dNgRPw7kxeuPiqetxW8TFZ/view?usp=sharing",
    "https://drive.google.com/file/d/1rZC07vo-m4HNcdGPWYWZl7G0vP9psmyY/view?usp=sharing",
    "https://drive.google.com/file/d/1fTVQyF1-o4-kgBgQ1_E7rYEV_F9H-Ev6/view?usp=sharing",
    "https://drive.google.com/file/d/1_R0uH-kFwaUIn9CkazoKErHK6DTR7PIq/view?usp=sharing",
    "https://drive.google.com/file/d/1mxOQGagQtMJR_30hKo7youiFrc8DWAv2/view?usp=sharing",
    "https://drive.google.com/file/d/17amxnnFXNUiTNHP5Dwuct3dfQu8Rsj82/view?usp=sharing",
    "https://drive.google.com/file/d/1gEEqSauL-_fU17WWjEksrCeOB55Mav18/view?usp=sharing",
    "https://drive.google.com/file/d/1aWbAqKzynXfsBalf4age-HQRVJ4hF32i/view?usp=sharing",
    "https://drive.google.com/file/d/1k0IHI99-nrXUOuD7nZHSEQV4fdrWPYW-/view?usp=sharing",
    "https://drive.google.com/file/d/10A498D7kYT_yML9hfUWUlTkmsXFcSuLl/view?usp=sharing",
    "https://drive.google.com/file/d/1ucDSVZqSWMllPbQHrlhSDgspeYap4DQM/view?usp=sharing",
    "https://drive.google.com/file/d/1OeV1L2WMrlIRTP2W-XHZR9d9e0K2fpkC/view?usp=sharing",
    "https://drive.google.com/file/d/1h92niugrcUlT4AW11TDM-LMLDAONxz2i/view?usp=sharing",
    "https://drive.google.com/file/d/1w3qw1gdsni9kQGCcC62GHaYuXvPIRM3Q/view?usp=sharing",
    "https://drive.google.com/file/d/19SP4qAl49HR82qXrnuE8J8quYo4IoR5X/view?usp=sharing",
    "https://drive.google.com/file/d/1XNsD-4Ow0tBJOG8jEdpcK0QcG_wDXp4i/view?usp=sharing",
    "https://drive.google.com/file/d/1vqvF-AYrgqNNcWr9TW-C8pg3Jk0VtPVO/view?usp=sharing",
    "https://drive.google.com/file/d/11QJjhOflzLDViD-ekPGr9XYs1d2yXMHt/view?usp=sharing",
    "https://drive.google.com/file/d/1Tks2kooBRxfI3T601tjkzkaeTLzS7bT3/view?usp=sharing",
    "https://drive.google.com/file/d/1czkB0nctYcOqNlKHSn7nx0u6Y1ROgXoV/view?usp=sharing",
    "https://drive.google.com/file/d/1Ba03qiWBYxR3-9-O06dC0Acal9OEWHIt/view?usp=sharing",
    "https://drive.google.com/file/d/1pzL5MYLjOd1IwgG2rLuzH-W4ksUUYZZP/view?usp=sharing",
    "https://drive.google.com/file/d/1NnZuthnVXQTTYX5f0G5xmgz4FjdbQIwP/view?usp=sharing",
    "https://drive.google.com/file/d/1lxB8TCTwC9IIA113Igv0oIeI3QW_HljN/view?usp=sharing",
    "https://drive.google.com/file/d/1nENvHR7HkqGceryonGqiu7nN9rV9HJTy/view?usp=sharing",
    "https://drive.google.com/file/d/1ixljWlXuTS15UENCenLenfhiEYKz3RNd/view?usp=sharing",
    "https://drive.google.com/file/d/1eFFvTrvT8rBj9Zeqz3qRa7guA6KTCuiV/view?usp=sharing",
    "https://drive.google.com/file/d/11h38L5TxtI8tnFS8BhkFTiya1EQOLW3C/view?usp=sharing",
    "https://drive.google.com/file/d/1clt4aD8SU5E1-bK6YulD_xGW6gejRAF9/view?usp=sharing",
    "https://drive.google.com/file/d/14cDxFAufeE-AChsXtEp_z5gR_lcoHd0C/view?usp=sharing",
    "https://drive.google.com/file/d/1qRXABWgzlWhbOj6KfzOzXkcVRHXt-J9W/view?usp=sharing",
    "https://drive.google.com/file/d/1CNe65BRVRb9L7snloLRMRkYSfwOpiCs4/view?usp=sharing",
    "https://drive.google.com/file/d/1LrohPS8zeXJ_hoDSjr3bZWTc0lk9ygjY/view?usp=sharing",
    "https://drive.google.com/file/d/1ciwz5sMgF1HgdmYq9cyrsS2kpzIa-kfz/view?usp=sharing",
    "https://drive.google.com/file/d/1RXFnxlqqMb5jjnz1003WN132l-3PKIyt/view?usp=sharing",
    "https://drive.google.com/file/d/1i9UzXLCoYsuj-t3BezPirbsW-ZXS-f2d/view?usp=sharing",
    "https://drive.google.com/file/d/18tqlDwfRkmlSlQDXrj17ZWxLFpPfzj2R/view?usp=sharing",
    "https://drive.google.com/file/d/1__gN3JZ6n766c3cMvbl9ThXvQbBmIcM0/view?usp=sharing",
    "https://drive.google.com/file/d/1Q_-mc7tKUyG1EtfMwz9eHMHcuZjDl64D/view?usp=sharing",
    "https://drive.google.com/file/d/1zWhXgbPVVkxnosVydjLHgWOApkP1-Bg9/view?usp=sharing",
    "https://drive.google.com/file/d/1KowqlO0VyUPe6JfT71aGjrcTd8lXn_WT/view?usp=sharing",
    "https://drive.google.com/file/d/1A-2xvY0volPkpOveoOkza9yRo2LDJojR/view?usp=sharing",
    "https://drive.google.com/file/d/1Eruc8QIRvHmv8hxf8iZE09Ds5yjFW-nO/view?usp=sharing",
    "https://drive.google.com/file/d/10cu5fvB2BRsBVjzKhFMNkGHw4hDEZjt3/view?usp=sharing",
    "https://drive.google.com/file/d/1yZ_eikzolUXUG2XeZ9OKbDgsGoaWZDNc/view?usp=sharing",
    "https://drive.google.com/file/d/1n1sTmTrp_oiUFe9CTA8uZkSNSPJbdIVd/view?usp=sharing",
    "https://drive.google.com/file/d/1pVrhEzG0sjMGQ-NeOro6egd8L6NKLIKE/view?usp=sharing",
    "https://drive.google.com/file/d/1K0o4t8aJp6aVKlaSn_-QJIFqEa7sVgS7/view?usp=sharing",
    "https://drive.google.com/file/d/1cUohkMpgMytmX0Eibqk5M7WR4Q_pJS1z/view?usp=sharing",
    "https://drive.google.com/file/d/1Y5WWD2s0nJk8qCFFKXWeXj5yfUXgVodq/view?usp=sharing",
    "https://drive.google.com/file/d/1HSwZre6ltxTqCr4SevgE7aFX7S_53B63/view?usp=sharing",
    "https://drive.google.com/file/d/1e4KJIFIDCqLuc2-o0kTcjWdhDZscDBDe/view?usp=sharing",
    "https://drive.google.com/file/d/1dcFvl_LOm11xicwsSOXFjBewX5QQB5S9/view?usp=sharing",
    "https://drive.google.com/file/d/10Tkd0ZQzT8I_Qk-V5gLtc8SchhWurhcr/view?usp=sharing",
    "https://drive.google.com/file/d/17kRqlYzAbJ1dNQibKDfNJ-Pr2mD58gs_/view?usp=sharing",
    "https://drive.google.com/file/d/1CXYpm7nFOo8dhfFc290JFsdrp7uSArb-/view?usp=sharing",
    "https://drive.google.com/file/d/11tFY0WDDj-yIVZDNGcygDsZVsVyC6a5P/view?usp=sharing",
    "https://drive.google.com/file/d/1XYbuSnHoKnZ9F-1D_ZMs_S_rjKVHFFxy/view?usp=sharing",
    "https://drive.google.com/file/d/1xuCzjv0HAm2CD8TDXtabnvbN6m0hnY3v/view?usp=sharing",
    "https://drive.google.com/file/d/1E3-HYMpXdCPVZwRAJid-jhq1Ox4th22E/view?usp=sharing",
    "https://drive.google.com/file/d/19K_5OJbArxbQrn9asw88P8sMtgfHISji/view?usp=sharing",
    "https://drive.google.com/file/d/1QV9h96uS76-V11Zybb7TrNQN9T2_9Pa8/view?usp=sharing",
    "https://drive.google.com/file/d/1Mxp1h5QTGCzQInLTJFNgLGcqwcjlcu4o/view?usp=sharing",
    "https://drive.google.com/file/d/1r3_4h0Gs3B63LSXtQW0buJbjkrvnFHJF/view?usp=sharing",
    "https://drive.google.com/file/d/1-ytEOWn80pftqqnicw9eDsMlHmVHaJHn/view?usp=sharing",
    "https://drive.google.com/file/d/1DGd6biRI0nPVDb0vjgcWqqwIePsL7B_J/view?usp=sharing",
    "https://drive.google.com/file/d/1Lc3v-vA2eMaTsqjcZDSn4JLezE3jA3tW/view?usp=sharing",
    "https://drive.google.com/file/d/1O4v21fv-jJV_G8VuK-I1hmIE4qyxUSun/view?usp=sharing",
    "https://drive.google.com/file/d/1GWsIUnrYC8BDgIto35XUhR-UdIjERmP8/view?usp=sharing",
    "https://drive.google.com/file/d/12sH6N8PSmqBZgaAmu8wE8NszKfh-TVi0/view?usp=sharing",
    "https://drive.google.com/file/d/1qytm__mh8jrnHSr0mXoXOUCKcNU2llxp/view?usp=sharing",
    "https://drive.google.com/file/d/1jvZlIhOJXgjQW4a3qkLmzIZecS4Wy2qE/view?usp=sharing",
    "https://drive.google.com/file/d/1g2M2A2ky6eUC38WrVn9AfV6lhr-6HsTa/view?usp=sharing",
    "https://drive.google.com/file/d/1-4cEcNdk6Sp89DkXJExljKJLtcPoh0Nm/view?usp=sharing",
    "https://drive.google.com/file/d/1IY6TcTluoNunNLVbn-L0f2-3f3lUl1__/view?usp=sharing",
    "https://drive.google.com/file/d/1oQx6HKDU1N3CWg4G9QLH3cNLW6CuP0FM/view?usp=sharing",
    "https://drive.google.com/file/d/1PKsOKnDCLVyKC-qtEZEC4kSwPydtEso9/view?usp=sharing",
    "https://drive.google.com/file/d/1U1emDTCXMGlTgir-qexxJA8DE0yTk6Jg/view?usp=sharing",
    "https://drive.google.com/file/d/1qJxQSDObQ--dxFI3rCF74wrVog2mfDlQ/view?usp=sharing",
    "https://drive.google.com/file/d/1tw3rs9WtaAbh9N70XdAN7RbQuMkeGUYe/view?usp=sharing",
    "https://drive.google.com/file/d/1hcpih_ly-nTidAsDZLswiSJWxlV6NLgx/view?usp=sharing",
    "https://drive.google.com/file/d/1f0mJKG6MSIMPoCziVcIpDQQ8PIVH9Nvd/view?usp=sharing",
    "https://drive.google.com/file/d/1YPDZOhnzozI5MsnMzQyIt1xT3B0Frb0t/view?usp=sharing",
    "https://drive.google.com/file/d/1KqmBI-FVpbYK3vpnu_sw9NEhIIPZlHFb/view?usp=sharing",
    "https://drive.google.com/file/d/1W94x281MRPyAI-KJ7rVpIixbWBjgARRT/view?usp=sharing",

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
        // 1. Extraer el ID del link que me pasaste
        // Tu link: https://drive.google.com/file/d/1Ou-u-XKSjMxCW6xQmuZCUbHbZ0DL4ldI/view?usp=sharing
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