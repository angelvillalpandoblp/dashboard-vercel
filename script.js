document.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
});

function checkBackendStatus() {
    try {
        const indicator = document.querySelector('.status-indicator') || document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-title');

        if (indicator) {
            indicator.classList.add('online');
        }
        if (statusText) {
            statusText.textContent = "Sistema Activo";
        }
    } catch (error) {
        
        console.warn("Estado del sistema: Elementos de UI no encontrados.");
    }
}   


function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
    
    window.dispatchEvent(new Event('resize'));
}

function navigate(viewId, btn) {
    
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.style.display = 'block';
        
        void targetView.offsetWidth; 
        targetView.classList.add('active');
    }

    
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    btn.classList.add('active');

    
    document.getElementById('page-title').textContent = btn.innerText;

    
    window.dispatchEvent(new Event('resize'));
}

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

function filterTable() {
    const val = document.getElementById("toolSearch").value.toUpperCase();
    const rows = document.getElementById("table-body").getElementsByTagName("tr");
    for (let r of rows) { 
        r.style.display = r.textContent.toUpperCase().includes(val) ? "" : "none"; 
    }
}

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


function closeModal() {
    const modal = document.getElementById('tableModal');
    if (modal) modal.style.display = 'none';
}


window.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadRefaccionesData();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(new Date());
    }
});


window.onclick = function(event) {
    const modal = document.getElementById('tableModal');
    if (event.target == modal) {
        closeModal();
    }
};


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

                data.slice(1).forEach((row, index) => {
                    if(!row.join('').trim()) return;
                    const tr = document.createElement('tr');
                    
                    tr.style.cursor = "pointer";
                    tr.onclick = function() {
                        openImageModal(index, row[0]); 
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


function filterRefaccionesTable() {
    const val = document.getElementById("refaccionesSearch").value.toUpperCase();
    const rows = document.getElementById("refacciones-body").getElementsByTagName("tr");
    for (let r of rows) {
        r.style.display = r.textContent.toUpperCase().includes(val) ? "" : "none";
    }
}

const fotosRefacciones = [
    /* 1-119*/
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
    "https://drive.google.com/file/d/173icldqMTQaZNEEeELwyMb886sfwKOXv/view?usp=sharing",
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
    /* 120 no foto*/
    "dd",
    /* 121-260*/
    "https://drive.google.com/file/d/12N7tPdml9JDtwwRhpVRYAJN3UuG4Fzm2/view?usp=sharing",
    "https://drive.google.com/file/d/1Psr_tPmcyV_3_giJe6ne4O8xitYAOKzP/view?usp=sharing",
    "https://drive.google.com/file/d/1iInavguG4JTQSql0jsGWdDPd7JZLs0EX/view?usp=sharing",
    "https://drive.google.com/file/d/1uPCo0Yx4XclxfnNSNSkxQ2PbEwdZMJFM/view?usp=sharing",
    "https://drive.google.com/file/d/1piNzmYy5n7xV_Uq_fsj_JZt-bRi1EqW8/view?usp=sharing",
    "https://drive.google.com/file/d/1SXAIWIWYiiLXY-UF3WeBo6YB1dL9GaKm/view?usp=sharing",
    "https://drive.google.com/file/d/1cp01vdPyfBu3LmRW-eyo4bBWo2uyGzve/view?usp=sharing",
    "https://drive.google.com/file/d/1ybGCA6-RENqOkSAD9t5vGEOr7grwqVZU/view?usp=sharing",
    "https://drive.google.com/file/d/1LjeocbpNtnfRwRI8WqBwPnIXkItZHtmA/view?usp=sharing",
    "https://drive.google.com/file/d/1suGcKcfWrk496Bk_66cGtNDAyN7quJnQ/view?usp=sharing",
    "https://drive.google.com/file/d/18Zokbvm9S75WXszJR2lX0JOcKVqQCA8d/view?usp=sharing",
    "https://drive.google.com/file/d/1tkaMXwH9kLE3al3lodgF8o17JodINKW0/view?usp=sharing",
    "https://drive.google.com/file/d/1CGvOPGGHDOasKZ1jxBtcdBeUr-cgtCp2/view?usp=sharing",
    "https://drive.google.com/file/d/1r_CVyQFIL2A7nEMUJChBiAG4TbTEKHKB/view?usp=sharing",
    "https://drive.google.com/file/d/1CB-7iCSUeKf8t7Yp06k6ncPqRNGRKbot/view?usp=sharing",
    "https://drive.google.com/file/d/1cEpm45d1cFvU_8kbEU7r0jUdpOwsxdF7/view?usp=sharing",
    "https://drive.google.com/file/d/1HNOiovGdh8M9DzW3a15xtKaYNWh_W536/view?usp=sharing",
    "https://drive.google.com/file/d/1jHXurqOIJC0ColF8tH_dA13L9ZpPXSxa/view?usp=sharing",
    "https://drive.google.com/file/d/19F4zOwFWNdCZfaBCEf0sE5faFIlmNXGi/view?usp=sharing",
    "https://drive.google.com/file/d/1CuHPbnQVs8Zdl9X4vpCzP_L1gsZRJvim/view?usp=sharing",
    "https://drive.google.com/file/d/1jJ3emkULDgZv1oWiYElu3A5s6zf5WRA1/view?usp=sharing",
    "https://drive.google.com/file/d/1dwuuBEEumLsayZ7EPuSehg-tq_vBOmkt/view?usp=sharing",
    "https://drive.google.com/file/d/1pPc0EFtKrDzHJlSFNR50wIbAmVKiCGxp/view?usp=sharing",
    "https://drive.google.com/file/d/1_FACWWooDEj_YCnNPMKZpArp65cvBGCW/view?usp=sharing",
    "https://drive.google.com/file/d/1FNDP09XAMRTWJQwi627ypAcjlTiiacpS/view?usp=sharing",
    "https://drive.google.com/file/d/1hpeZvOKIbmRos3tsMrCNT1Tr0913AUZJ/view?usp=sharing",
    "https://drive.google.com/file/d/1eVWD0HvPZO0YC0TZrO30QGWeTpQIhCZV/view?usp=sharing",
    "https://drive.google.com/file/d/1N9dQh7cSTwRb0-02Xdy-ZY84llFOcZD2/view?usp=sharing",
    "https://drive.google.com/file/d/1bvR8D1NG-MBKoye4o2MRSap4CWxduLjC/view?usp=sharing",
    "https://drive.google.com/file/d/1lcMhyzdnSqRQBCe4wHP4E29xcmcf0tGe/view?usp=sharing",
    "https://drive.google.com/file/d/1Rz4fp03b4WmJL-T-swppP-GMFUoe9QA1/view?usp=sharing",
    "https://drive.google.com/file/d/1NFvGGJTlEj8R9nfgsJcsmyLY2TYL-foq/view?usp=sharing",
    "https://drive.google.com/file/d/11okxUNl8f46XgUQtn6nQqdQ0kHP-W6Pw/view?usp=sharing",
    "https://drive.google.com/file/d/1eK7aaAEv_Qa_xtBYcnln8BibI9b-zf1-/view?usp=sharing",
    "https://drive.google.com/file/d/1aKbQFVyzFCm8gm9Lkxv0rVB3WmWoGJuP/view?usp=sharing",
    "https://drive.google.com/file/d/1XIv-CDmPer78vGpvOuvtGyZqSeRzJEHC/view?usp=sharing",
    "https://drive.google.com/file/d/15lGNHZEGsjCEdvZnvxcQhMVwWk35KOXL/view?usp=sharing",
    "https://drive.google.com/file/d/1noZFWW5jejSp2JV3aFpUQ34Qf8yz1a_1/view?usp=sharing",
    "https://drive.google.com/file/d/1lyJE3TQgyY-lnws0Qi3hpp5qrAIaXnM7/view?usp=sharing",
    "https://drive.google.com/file/d/1AAvFoC8icMFqWjtS8xlxQ-Szmjo1F8pL/view?usp=sharing",
    "https://drive.google.com/file/d/1y50y8MoZL029sShPEfigLEootnQF31uE/view?usp=sharing",
    "https://drive.google.com/file/d/1RbyQb3sJ8Bmtjk3eWOkjgCc5Z2fjkaeD/view?usp=sharing",
    "https://drive.google.com/file/d/1idFJpUv-8WVfCJuwvYDQVRcB0o2BRdaY/view?usp=sharing",
    "https://drive.google.com/file/d/1x8TDcIBaH-O2w6ECVC9os_xFNVxtdZk7/view?usp=sharing",
    "https://drive.google.com/file/d/1FIqueViBGykS73nTCtYZMXaHTMQjS9R5/view?usp=sharing",
    "https://drive.google.com/file/d/14N3q74pEtkKggGZFy5E5x_3SfYxC7lTE/view?usp=sharing",
    "https://drive.google.com/file/d/1IO7IZsoHQ-m20sADNX5xatNy4Lhy6EGj/view?usp=sharing",
    "https://drive.google.com/file/d/1mTbHLAeLBZbgeuM9rV3hg3XCYbFJYh_3/view?usp=sharing",
    "https://drive.google.com/file/d/1Cx3JalIBP5WKy30KRcM7lds3vjadw61G/view?usp=sharing",
    "https://drive.google.com/file/d/1xr5perVFll3YLHp925I9J_ybTIQfTwhW/view?usp=sharing",
    "https://drive.google.com/file/d/1Wgz9c8Mc4TJWolkiYrNmhRIqHa-K94C0/view?usp=sharing",
    "https://drive.google.com/file/d/1NIXLSkc9Z5wzjxjN8iCkacJUCjvBxOUy/view?usp=sharing",
    "https://drive.google.com/file/d/1kFHzN2q5CrWmPcxG68U7Uj4pfkgIaev0/view?usp=sharing",
    "https://drive.google.com/file/d/1iver7dlhMwqcLxVey6cft0SHnrc5SPSL/view?usp=sharing",
    "https://drive.google.com/file/d/101Q4hM3GaTecGz6ZTuaqHhRSst5PA4y4/view?usp=sharing",
    "https://drive.google.com/file/d/1kfSDXhohMktetM9KR_kvyxpCKUxKymkC/view?usp=sharing",
    "https://drive.google.com/file/d/1WDrTimYo156cllNLevEMsaK7KYF5eDy-/view?usp=sharing",
    "https://drive.google.com/file/d/1DKA7kquYygwqw1GrHq8QQ44c51FuJqco/view?usp=sharing",
    "https://drive.google.com/file/d/18MZyJlLZnBMTyuP2N_xtgDAK6evp3dng/view?usp=sharing",
    "https://drive.google.com/file/d/1_j2SEnpvaojaQ_lAMq3sHI-lOKgD5T52/view?usp=sharing",
    "https://drive.google.com/file/d/1TNC0eQYsftucqhtTm5WzfO-1uQeAyk_B/view?usp=sharing",
    "https://drive.google.com/file/d/1PmOJpmyrUZ85chhYYP0YvlfqYmNYoD0t/view?usp=sharing",
    "https://drive.google.com/file/d/19IFnnFH55j3dtLv0jaKaMREz6-BJbjHW/view?usp=sharing",
    "https://drive.google.com/file/d/1K7zA8bK12fLEhkes48eM2dZVkyCn66Qw/view?usp=sharing",
    "https://drive.google.com/file/d/1d7yn7MqPxK33P7DYSZqhXyTHeRZzDUUn/view?usp=sharing",
    "https://drive.google.com/file/d/1OsQaDwkcqX71GBciX4WgkSxDo5tXYd5y/view?usp=sharing",
    "https://drive.google.com/file/d/1p0Sxb3JfvZ9jzkQ2r3TAzKibfHfk95td/view?usp=sharing",
    "https://drive.google.com/file/d/1M8Phvh8GH3gvOufP5CVRgitgZdWKddkG/view?usp=sharing",
    "https://drive.google.com/file/d/1uXrPOM56H1I3zIDn40xnV_2CJoTxbd6i/view?usp=sharing",
    "https://drive.google.com/file/d/1iBrxEfac2yw7zUKjOYCDIPIaxXiHecD4/view?usp=sharing",
    "https://drive.google.com/file/d/1vTRrDZ0zZmTn_e9U2xkdrKfwf5S0sLEV/view?usp=sharing",
    "https://drive.google.com/file/d/1DRF1Wde_esUeXht1mY77YBbK7v1ynfwC/view?usp=sharing",
    "https://drive.google.com/file/d/12OifftxPCEdJKSH8oNkMvhtcM9THnVAF/view?usp=sharing",
    "https://drive.google.com/file/d/1pZUlCk7VHgXlXUQsW515pLL4jv4N0vS-/view?usp=sharing",
    "https://drive.google.com/file/d/1sTIEc3tfwsb_PBtp6ShkY_nqEjkzDnOH/view?usp=sharing",
    "https://drive.google.com/file/d/1qz9XojM7AT5MQzfXppm7YrLHhq2FWzfN/view?usp=sharing",
    "https://drive.google.com/file/d/1lRrlCS81h4NgOAQuNhq4bFmKXz_87_na/view?usp=sharing",
    "https://drive.google.com/file/d/1TQ98DYwcKsPiv1hziT2oYiUrq_wl5C3D/view?usp=sharing",
    "https://drive.google.com/file/d/1Vbd5f80QDzEDfnmimniXk3oQIVOPJZtr/view?usp=sharing",
    "https://drive.google.com/file/d/18AB2lUBptO7OY0aUtCgGhaDae2iXNwFz/view?usp=sharing",
    "https://drive.google.com/file/d/1G2wCupz1XaiRkHrlP-zmdT3jDvT7F8_j/view?usp=sharing",
    "https://drive.google.com/file/d/1V7bj1X0Rnf0LPBW8uEwGX9HsmDYhjF7G/view?usp=sharing",
    "https://drive.google.com/file/d/1eSErSvaa5XxtCXPNZRzAD2YUDnrtUCkn/view?usp=sharing",
    "https://drive.google.com/file/d/10TiYjlR97RJ8pnKV6lSV42SNTy7ixnaF/view?usp=sharing",
    "https://drive.google.com/file/d/10Wb2xc4YAx2-RKmKnbgrderA64DQrn_3/view?usp=sharing",
    "https://drive.google.com/file/d/12WNyQr-wxjS0LsdN8psJ6lOsnjYVmE4m/view?usp=sharing",
    "https://drive.google.com/file/d/16rLeWR17hkXfwYSslqF65nx_c8nQgX1H/view?usp=sharing",
    "https://drive.google.com/file/d/1u7eWjpj1MbOSMoMAzSB6CpH7uHwRNcFs/view?usp=sharing",
    "https://drive.google.com/file/d/1keV8DOqSOJqFAVJilIrURtYhqKCCEFJs/view?usp=sharing",
    "https://drive.google.com/file/d/1HeZ9268t4Bro_3DVS15wvYTvWC1uXFxG/view?usp=sharing",
    "https://drive.google.com/file/d/12rfXp7zQMZjMCWRkRS4riBKbeVv_B9_-/view?usp=sharing",
    "https://drive.google.com/file/d/1Bh2j8f7S5MQjDUJTz6-dF6wNVZ4LkLM-/view?usp=sharing",
    "https://drive.google.com/file/d/1HsWM5mvhp8LhmMG8fCCkTKEKOwLS-2XM/view?usp=sharing",
    "https://drive.google.com/file/d/1LsgnTEl203uEayD7oxg-qZA72Oy64sjj/view?usp=sharing",
    "https://drive.google.com/file/d/18IN-eDZvtIF8Qaa1MS8QYYTe1kaMQQKK/view?usp=sharing",
    "https://drive.google.com/file/d/1f7SKTlWRxcv8_iKfezoxsEQLhCRtUw6-/view?usp=sharing",
    "https://drive.google.com/file/d/1Zti0BpfgkfMQNHL7o2tBR2ZD9bDWOey-/view?usp=sharing",
    "https://drive.google.com/file/d/1rNSoclsvYVFjFqmL_5TmGSyVvpLgtRXM/view?usp=sharing",
    "https://drive.google.com/file/d/1yp9UxoOfKwDLyAvv1eWExA8i2veEyvcQ/view?usp=sharing",
    "https://drive.google.com/file/d/1xOrUkm0M_H6aDrFzN9zFJCeqErE0JPX9/view?usp=sharing",
    "https://drive.google.com/file/d/1pC5iymdEIzWNVqn7ckEL0BVyrD-6au6X/view?usp=sharing",
    "https://drive.google.com/file/d/1_T-K_hLPAIyMxoL1i6srCz41QFTXHo1G/view?usp=sharing",
    "https://drive.google.com/file/d/1Vq3V-F5klSlnsom2MGcnCLKXqK_owup7/view?usp=sharing",
    "https://drive.google.com/file/d/1Agp9lKK2lcaqcGRxiRZAwoz5JkwsJmAb/view?usp=sharing",
    "https://drive.google.com/file/d/14mrITvoZk5XTNQKzMuGQgBfbSmm3KSEq/view?usp=sharing",
    "https://drive.google.com/file/d/10XS5_LsQ_yC84q7WtUyuf8Q9Rr4NQaK5/view?usp=sharing",
    "https://drive.google.com/file/d/13sGvPw0X0wmYtfjUGnWIoD9T8H35uxDE/view?usp=sharing",
    "https://drive.google.com/file/d/1xoIAd-YXYV8r5NLcXQkgs8iVMosjjhXU/view?usp=sharing",
    "https://drive.google.com/file/d/1ikLbHhnN6WIf7P_GPOE24a_yQvu_0Ry7/view?usp=sharing",
    "https://drive.google.com/file/d/1vcbuC-RTlbtRJzYZ80MWQxu2knSSSUlW/view?usp=sharing",
    "https://drive.google.com/file/d/1YfoZZl-fB3AdsmDDQIn0tuPoCubXKYwp/view?usp=sharing",
    "https://drive.google.com/file/d/17afc6nvSMf6LJsPDNpttn87zEQLFH2UK/view?usp=sharing",
    "https://drive.google.com/file/d/1-Xm1Jj2KmkR8EfK4hS1OGJUXfEZKmPVO/view?usp=sharing",
    "https://drive.google.com/file/d/18jDiIHM1FoqpT9pIQbZKp11_iFLUTa8v/view?usp=sharing",
    "https://drive.google.com/file/d/1sgZNV5MEXfnedB-lSEgHgGj2D64M_Xj1/view?usp=sharing",
    "https://drive.google.com/file/d/13DMj5gdlFQC2EorZeNTu4s5t3SkCT1Kc/view?usp=sharing",
    "https://drive.google.com/file/d/14FE197TovWdWbgzLg9fkht44kmbpVmvk/view?usp=sharing",
    "https://drive.google.com/file/d/1RhBW41jV-MRZGKTJ05NYDuZqNLKUBg8Z/view?usp=sharing",
    "https://drive.google.com/file/d/1HB1Sx2mXPGEYtMLHonQEhbgrttB1Vb1T/view?usp=sharing",
    "https://drive.google.com/file/d/1jQ2sV6TKAvXb48G1uL2zQK633FUxrWbc/view?usp=sharing",
    "https://drive.google.com/file/d/1PMpJaJsx03dsmqnJQIRO3PhHM5NULhaj/view?usp=sharing",
    "https://drive.google.com/file/d/10g1d5nBOCTKKrr0vqkp9apL9gd5500OT/view?usp=sharing",
    "https://drive.google.com/file/d/1RCwWXQV8Bs2djaE2lK9Oy01tCmRAdonQ/view?usp=sharing",
    "https://drive.google.com/file/d/1REQ-1tdC8Hfim4QEnAQ8TP79ILjZLbdt/view?usp=sharing",
    "https://drive.google.com/file/d/1HgTTqu3-DxTqfKWZSIacQNSa5SW6ci4p/view?usp=sharing",
    "https://drive.google.com/file/d/13dXxwB0E87LEu4-mB1fCTKRgAIGhLS-s/view?usp=sharing",
    "https://drive.google.com/file/d/1dsZRfc6jBvpmV59v4B_Ctn0H5iDUQAZ4/view?usp=sharing",
    "https://drive.google.com/file/d/184PfwFN73VBxToNM6QW3BfZi36e3tYb1/view?usp=sharing",
    "https://drive.google.com/file/d/1b89cH55ZlTgnUA0tUa8ExY16tplB4MgP/view?usp=sharing",
    "https://drive.google.com/file/d/1jBz4S_0KZ17k2bhb0A0pWzCGf_yJL2Me/view?usp=sharing",
    "https://drive.google.com/file/d/1QgS1vv67x8o_EWvjd6RLpLW1MmJ39t6B/view?usp=sharing",
    "https://drive.google.com/file/d/1rtxSgTn3eVmr5B65OwZ1Ki1tDvX_8BjV/view?usp=sharing",
    "https://drive.google.com/file/d/1ErgNFQDm9aaJ2S8aAvqGzf-ARqMkf_Fb/view?usp=sharing",
    "https://drive.google.com/file/d/1M-H9fwAgrKaBEI4RyXcCVly_czqxd28w/view?usp=sharing",
    "https://drive.google.com/file/d/15SDjyO2AyFtmBj_u_davn4bnrt4XTKlL/view?usp=sharing",
    "https://drive.google.com/file/d/1sdpfa21JbSRCZv3LV3cC4fMuFIl5VXDk/view?usp=sharing",
    "https://drive.google.com/file/d/1VvIbKghN1Jd5Ocw164D7RQpzTFpTh5HE/view?usp=sharing",
    "https://drive.google.com/file/d/1MNsAFN6NeZRWKtCvOZS_LYhtSFxCc9pm/view?usp=sharing",
    "https://drive.google.com/file/d/1lyKJ44zEj8E0pXExqS62Qk-suZn6gsFD/view?usp=sharing",
    "https://drive.google.com/file/d/1bwetyPU9S0a_DltKtp2nFQ-YyFxEd--4/view?usp=sharing",

    /* 261 sin foto */
    "dd",

    /* 262-331 */
    "https://drive.google.com/file/d/1Iv3v3mmYBQvgZvdMlTjeGavdnyEV20oX/view?usp=sharing",
    "https://drive.google.com/file/d/1QhJrHQctHsJj6Bj__4aIRV4I0YC75fMh/view?usp=sharing",
    "https://drive.google.com/file/d/1UheFiSBU7r99PfQ0HlUbr-r6Qok-zTzS/view?usp=sharing",
    "https://drive.google.com/file/d/1hd2zhVr9srGDnMtxNAM85eDOsiPD6zPm/view?usp=sharing",
    "https://drive.google.com/file/d/1bCaC5gH7JFC-fS28hfsS-Mb7TsAkVNF0/view?usp=sharing",
    "https://drive.google.com/file/d/1KV_eOs1d0bDFVxIzKzHFeORm2e6M4eic/view?usp=sharing",
    "https://drive.google.com/file/d/1_RH188kT-pfkt0zzledFiIHKQaWUANei/view?usp=sharing",
    "https://drive.google.com/file/d/16l62xs8SiRLOyoPD5KzoXpp1i9URyKt4/view?usp=sharing",
    "https://drive.google.com/file/d/1L_S7KtrUQbehjg14ZcKHL3biWXvomkUL/view?usp=sharing",
    "https://drive.google.com/file/d/17hid8Jy1Q7ZZ4NogHRRXwj3xZhVveY3R/view?usp=sharing",
    "https://drive.google.com/file/d/1QOBIO2m3nanokrrgxRoHwkAekmm9oyxY/view?usp=sharing",
    "https://drive.google.com/file/d/12xeXaqtldKo6ZuVPe0pGXHeufkB-ztbR/view?usp=sharing",
    "https://drive.google.com/file/d/1U5et1BmDBGHROxnZj_2YXKnGihrY6J5B/view?usp=sharing",
    "https://drive.google.com/file/d/1STPd9Nn1-OqbC4PQIDlyvMbxX0h-5HQH/view?usp=sharing",
    "https://drive.google.com/file/d/1QInXx4BUmyPtjErwgXtpXJ7hjGqiXWUH/view?usp=sharing",
    "https://drive.google.com/file/d/1LvrKYWQP6h02ZD4jrFcKcmZWet0M9HGV/view?usp=sharing",
    "https://drive.google.com/file/d/1LsxgbGd3yfVC9THhuCFcmkU7IAAurz9T/view?usp=sharing",
    "https://drive.google.com/file/d/1bfGs4AM_AWoOCUABl493RiOkKpkgrg3S/view?usp=sharing",
    "https://drive.google.com/file/d/1yPKZiNUjb_1jXaZL5H2FqJ-qyu2D3vZ0/view?usp=sharing",
    "https://drive.google.com/file/d/156IUhoHMpmFPj6uRE6Mw3oG4MYTGL1Pi/view?usp=sharing",
    "https://drive.google.com/file/d/1pOzg_Xrgji50agmkaGLgxGt-NweKlu69/view?usp=sharing",
    "https://drive.google.com/file/d/1bZQ3FYE-P_qggCbv_GoVuiFqGv9z74_E/view?usp=sharing",
    "https://drive.google.com/file/d/18l9zkH444SjUXGXX5DLEbgBDFRq9UuTj/view?usp=sharing",
    "https://drive.google.com/file/d/1_3EC8OeuHAaLmBG5OQoEFb_MQlVkC-HS/view?usp=sharing",
    "https://drive.google.com/file/d/1oW4UHLybNZLksHusRmF3TCyOu_bQ7QP-/view?usp=sharing",
    "https://drive.google.com/file/d/1qnqLCcf3jZNtTZ7u8DwKyy9spqpRkqV_/view?usp=sharing",
    "https://drive.google.com/file/d/1b6jqupiscAzlDNcGzP5sLqWqaWfrGf6K/view?usp=sharing",
    "https://drive.google.com/file/d/1x_YWi0gNuDrNPBdOT2VzGpyE8NEtXKx0/view?usp=sharing",
    "https://drive.google.com/file/d/1IF9h1RIa6NpdfTHwEi6xx-xP0PMWxmjN/view?usp=sharing",
    "https://drive.google.com/file/d/1G1ock-TDrRreEjnev9UNyMxaOWw_6_50/view?usp=sharing",
    "https://drive.google.com/file/d/1e_LwH0xPZE55f9mvsdx0HQT70xUCCpD1/view?usp=sharing",
    "https://drive.google.com/file/d/1CLgaXG_iZE807sbDP7E4kln1u41O-G9T/view?usp=sharing",
    "https://drive.google.com/file/d/1HpHPPxN4J9UjZSTUUkKXlXdSUyCuYXhP/view?usp=sharing",
    "https://drive.google.com/file/d/1CcahPpxajlwUd7BqREJGDLDsOMjArdIg/view?usp=sharing",
    "https://drive.google.com/file/d/1YR7RJnaP6WUNbVNx8HMHhP4EC48q3N9a/view?usp=sharing",
    "https://drive.google.com/file/d/1_wJTvdlRvs1vV4fvbaP9S2NM0xYZWE16/view?usp=sharing",
    "https://drive.google.com/file/d/1ehm3g0oXWMjK6vdbKwO9fVk31Vt29huY/view?usp=sharing",
    "https://drive.google.com/file/d/1OHPleiT_g11Y6lFQfISNNHRe-yOr41By/view?usp=sharing",
    "https://drive.google.com/file/d/1NRryvXTiQBJ21CNW1R2n7zMDbN-FuhNW/view?usp=sharing",
    "https://drive.google.com/file/d/1Gd4hb-LCZbtvpvzhVrGEpwHp9VJJF4_B/view?usp=sharing",
    "https://drive.google.com/file/d/13_S7fmAp9OTvNvDKwDu6eG9NNpAWBdWO/view?usp=sharing",
    "https://drive.google.com/file/d/1NALsnhJVD7LaS-mPrDja_OArn_-JQX_O/view?usp=sharing",
    "https://drive.google.com/file/d/1gYBQ5GpqCufjXn3R_buFcJ0y-D2Xr_O9/view?usp=sharing",
    "https://drive.google.com/file/d/1rKQXedH8mt8LA3g_r6xoLZPLYCVHHY8w/view?usp=sharing",
    "https://drive.google.com/file/d/1vHlLQi9cm-_7zmyNrrJg9Di-UCLflyaW/view?usp=sharing",
    "https://drive.google.com/file/d/1ru1UGRsP-jGTllkVdb2RIYc28vpfLlC_/view?usp=sharing",
    "https://drive.google.com/file/d/1lTURmS7_6KAzoD0JLZ1500sOYCM1Dwpm/view?usp=sharing",
    "https://drive.google.com/file/d/1V1Pm5rGxSK8eqVjLu9KAUpTUcjVqXqjA/view?usp=sharing",
    "https://drive.google.com/file/d/17xwmY6AT5YDecS3nsTOE-P3gadL4Gp3t/view?usp=sharing",
    "https://drive.google.com/file/d/1jNU3v66DxNTYU-Xut0UaXMAfMJtf7c-Q/view?usp=sharing",
    "https://drive.google.com/file/d/1MMpj6EihX73qxPb-9uI-8kDZt6EXRMCd/view?usp=sharing",
    "https://drive.google.com/file/d/1BVrEsfvQ54iaECqStQiS6JgLiz4P5DnM/view?usp=sharing",
    "https://drive.google.com/file/d/1y3o8ekJrkeGVTNL10dES_CTE-4D9_E3l/view?usp=sharing",
    "https://drive.google.com/file/d/1FbCxQnO_dkOkFTc63Io5OsbH8-hiyBBb/view?usp=sharing",
    "https://drive.google.com/file/d/1yFOSNnvF2DZJOVJ7Ju-c4Bmw-aKiK0EF/view?usp=sharing",
    "https://drive.google.com/file/d/1qTWVZJn5Hl6Dhz2XNjw8VOOivv0YjU8a/view?usp=sharing",
    "https://drive.google.com/file/d/1-4BGr9F_MMtciZoga26hSu7LEO4odS5i/view?usp=sharing",
    "https://drive.google.com/file/d/1_AJkz31ZAEKWu6rirych4wd_0D-QTgAL/view?usp=sharing",
    "https://drive.google.com/file/d/1OfVe0RjJkJ8cKDVcDKuFp6dI5KWm1DMu/view?usp=sharing",
    "https://drive.google.com/file/d/1EKLkOJ7XxkEymVDECE8ZTUTXWD8aj8rY/view?usp=sharing",
    "https://drive.google.com/file/d/1x8UjDoo2kCYC7HZx3bfeaDc5G5q8zP_X/view?usp=sharing",
    "https://drive.google.com/file/d/1LyL1rXt_rnOtu3GsrBFh_sBTsVIRURa1/view?usp=sharing",
    "https://drive.google.com/file/d/11snR0sU3HIX73GLM4W7C7rHDzQYMlq53/view?usp=sharing",
    "https://drive.google.com/file/d/1oO9oaojosM_q23ROB5BB4GaAPLjY7_am/view?usp=sharing",
    "https://drive.google.com/file/d/1ltUIP4ocLK_4mjLQtqOd6d9TXGkv1EO4/view?usp=sharing",
    "https://drive.google.com/file/d/1QEp0PDRTUTTWs81oTJBKG_hwdSDBv1TC/view?usp=sharing",
    "https://drive.google.com/file/d/16u7UEDEph3_nVKYx7q2RSVJ1bps8QHT7/view?usp=sharing",
    "https://drive.google.com/file/d/1FxFFNwKE4lOBEITAktv0ngbHiS_JOt7X/view?usp=sharing",
    "https://drive.google.com/file/d/1E-CxaTe-T6-XecCv875D1-ZdUkQBa0ii/view?usp=sharing",
    "https://drive.google.com/file/d/1BaOxXzLXPIyWSf6qCH_1iKivFbw6Pb-F/view?usp=sharing",

    /* 332 sin foto */
    "dd",

    /* 333-422 */
    "https://drive.google.com/file/d/1JKlKHGdqRIaqIt-P5AtVztRnAObM6C3w/view?usp=sharing",
    "https://drive.google.com/file/d/19F86BcyvwEg_uCtd1z_yDNFembXKcJFg/view?usp=sharing",
    "https://drive.google.com/file/d/1CfVdKMLhs4ah8UPNdNy2v-otFRKXRaDp/view?usp=sharing",
    "https://drive.google.com/file/d/184_MhNxkdoMxy-hoIWu9mDzf2p8V0lrV/view?usp=sharing",
    "https://drive.google.com/file/d/14fa3uiU_CNe3waCsJMEL_s25QSQaw9zG/view?usp=sharing",
    "https://drive.google.com/file/d/1gaYXd7twjoxQR_xQFXpbVwezm-ZsF2lI/view?usp=sharing",
    "https://drive.google.com/file/d/17ysy_9oNV0DxKKQPtPcXTNuIpHSJxDVf/view?usp=sharing",
    "https://drive.google.com/file/d/1v6jjDkwCzdyNKzEhhlzmIh_L1C5R8CYn/view?usp=sharing",
    "https://drive.google.com/file/d/1Xcb6oqA0K_QiYlCsZ63L9eCg2rRKhVDl/view?usp=sharing",
    "https://drive.google.com/file/d/1Gszn8FcsUwvIvnca463UqfwDVFh5s_bm/view?usp=sharing",
    "https://drive.google.com/file/d/13rodUGtKgqO9ga9Gs_kP6n6OV5M1uvyM/view?usp=sharing",
    "https://drive.google.com/file/d/1GCkkj1wWFGAcMBHXYbf6XCmZwA_006cY/view?usp=sharing",
    "https://drive.google.com/file/d/1n4C8ALkRoiQ1RZw3p4CD3BhA_stNRpyn/view?usp=sharing",
    "https://drive.google.com/file/d/135C9a7uACiIzjhNuYF-HwkJoCYLQayjG/view?usp=sharing",
    "https://drive.google.com/file/d/1pOz5wAuoQW3c9bLAJgfbaRCB_JhxTcPw/view?usp=sharing",
    "https://drive.google.com/file/d/1ZpWFDX-yeiC1a-XjLbEpPpmuCAGcZA1P/view?usp=sharing",
    "https://drive.google.com/file/d/1HlyASNEBuamWi20r2onf11Q87iPSusE5/view?usp=sharing",
    "https://drive.google.com/file/d/1RGWI7AOyyoCH5kq7Ft5Xrbny3zKSmkz3/view?usp=sharing",
    "https://drive.google.com/file/d/1M1qvY9OYDQVqbOxzKjSq2XTvaj8Zbhrr/view?usp=sharing",
    "https://drive.google.com/file/d/1QK4E6m01RJ6FTP0nLjJpDBUvW-qWYtsO/view?usp=sharing",
    "https://drive.google.com/file/d/14iUxwHBDVUA8_6sZkz8YkMU8qwo62MzZ/view?usp=sharing",
    "https://drive.google.com/file/d/1TgR9fnTjJ7AoVTgdr8MwwGaY5qfuTP4e/view?usp=sharing",
    "https://drive.google.com/file/d/1VB7X5uxCCtIFWw8lgMLvi8Uur-VX9cbd/view?usp=sharing",
    "https://drive.google.com/file/d/1Pn9DjaT3Fj1XmwjesulHTkgxOfNsphFx/view?usp=sharing",
    "https://drive.google.com/file/d/1RUfH7gFrCsyiWpdBvO99gWHkfzyoGV6V/view?usp=sharing",
    "https://drive.google.com/file/d/1A_PIeA65j9E4bwFzw-LAGE5kyXAoSwyG/view?usp=sharing",
    "https://drive.google.com/file/d/1Ren5A-qbQQuDizI3bfb-1D66FAAoBWex/view?usp=sharing",
    "https://drive.google.com/file/d/184ro4ogX93tHcGP3Y7nQMjnXKx3ciIbO/view?usp=sharing",
    "https://drive.google.com/file/d/1Z3tm7mPam7rura_CYs_okwy9WlhAbbL3/view?usp=sharing",
    "https://drive.google.com/file/d/1H8KdlSYkJzeVl8saNfvZJfkre_GWd1m_/view?usp=sharing",
    "https://drive.google.com/file/d/1WtY8E60R0Uo9jq4cqdcOqHiwJ08VnLfs/view?usp=sharing",
    "https://drive.google.com/file/d/19AYHIu5HkH_j572pR5AzAul8IGqo3s7W/view?usp=sharing",
    "https://drive.google.com/file/d/14IigoLK42D5NTCgPPuAGRzEB2PAnnYJY/view?usp=sharing",
    "https://drive.google.com/file/d/1UPd5ysj8K-k4nxfpItAf0KssZwZ1QIIp/view?usp=sharing",
    "https://drive.google.com/file/d/1mt0hABBO5Srv2AWYZEeN_8yjDnnUlLTy/view?usp=sharing",
    "https://drive.google.com/file/d/1CIIFHtTOKFpRUZc_hQeypkWKbF3BnzID/view?usp=sharing",
    "https://drive.google.com/file/d/1YKL8grCaNT2cYMwO2fZWf_ZD8RIZHONn/view?usp=sharing",
    "https://drive.google.com/file/d/1Vgt_kByskCORrrbp-31UpoU787j6NXxz/view?usp=sharing",
    "https://drive.google.com/file/d/1f0oqyMCklFK7xoWT2cdGmeQTQ0-K8aPb/view?usp=sharing",
    "https://drive.google.com/file/d/1NGEVHFITZFDPiP534rnVCTw39HvtTNT0/view?usp=sharing",
    "https://drive.google.com/file/d/1EJv2NEZ0DPHdjVNgfZAnjRWpNamykwrc/view?usp=sharing",
    "https://drive.google.com/file/d/1VUOABm-3KTl86YpD3sTiFy5tC7ffwAzC/view?usp=sharing",
    "https://drive.google.com/file/d/1sj_WYez3GcbjYN1RwW-jelFLL-oEGj0J/view?usp=sharing",
    "https://drive.google.com/file/d/15pjGqp4_nMlEpnxThlD6vZR77gA1ADxN/view?usp=sharing",
    "https://drive.google.com/file/d/197-KtmUBEV9QdtAHz9sLCY9IcIuPMzrp/view?usp=sharing",
    "https://drive.google.com/file/d/18Poc838rmebRqORj0oSp9jUrExOnXlKM/view?usp=sharing",
    "https://drive.google.com/file/d/1QsPhvQTKSZjwgwt9-vXt5W2jLiCIXJ9Z/view?usp=sharing",
    "https://drive.google.com/file/d/1ylafbRqJWc7pTGpkNylnjVHptwdR2yUr/view?usp=sharing",
    "https://drive.google.com/file/d/1Sg_W7WgnWx6ysuv8CTHx94RsnNfwmTt4/view?usp=sharing",
    "https://drive.google.com/file/d/1xTb8ozWBNfoSPokzxHh8OJYiWCitlWIp/view?usp=sharing",
    "https://drive.google.com/file/d/1lpOIJVN-foyV_M9fXcrkVQPGyHEPmmU4/view?usp=sharing",
    "https://drive.google.com/file/d/1TcO_l4_8NM5q8SsHPUSxrfd7xa22FDzK/view?usp=sharing",
    "https://drive.google.com/file/d/1DIEyu9dUnJ3lDJ7tHyc6S7Hzb5Mggkf2/view?usp=sharing",
    "https://drive.google.com/file/d/1T_bivUJhZXJUj6QvOOROu5l1UNqgI1GA/view?usp=sharing",
    "https://drive.google.com/file/d/1v2RfmC_QiL17XIY9GraoLfeChSl6xE7p/view?usp=sharing",
    "https://drive.google.com/file/d/1MTvLUKdO5OuyVPeK_-q8NN7zzJNW1rrt/view?usp=sharing",
    "https://drive.google.com/file/d/16v6OFxEDiv9_vGjg3zJTljDQKLvwzcXs/view?usp=sharing",
    "https://drive.google.com/file/d/1x7E0JkX5oVLmRudNyCHIRI99U2D1WggO/view?usp=sharing",
    "https://drive.google.com/file/d/18SFLiBW0joTTl-3cM-ooo17kavC4aneN/view?usp=sharing",
    "https://drive.google.com/file/d/1KNVaii7s7EjRZEuWfaSAWo3ePFtLMqoO/view?usp=sharing",
    "https://drive.google.com/file/d/1ZqDjhtYTONdyjshM2o14IXfOvy7A4ijv/view?usp=sharing",
    "https://drive.google.com/file/d/1JvRwY2LSivIZziQF4CkaDihonOY5nmJK/view?usp=sharing",
    "https://drive.google.com/file/d/1dYrMjIppvcsmz5qJ6mlvKyRypr8di5-P/view?usp=sharing",
    "https://drive.google.com/file/d/1qnY9JocwmfIMzarc2A4Umcxe7GL_0JdS/view?usp=sharing",
    "https://drive.google.com/file/d/1uSR7O5E4XO_beLMdCbFo6SOGXtYEOFqe/view?usp=sharing",
    "https://drive.google.com/file/d/11-1Juksg2PobUikVKmWZ2Ox4H0r3nkq-/view?usp=sharing",
    "https://drive.google.com/file/d/1cNi-doOdbb6MHzFtszN76g5ukSSjb-eY/view?usp=sharing",
    "https://drive.google.com/file/d/1U0yjTxy2ZCTSN35OMBl1UDYmYPnrmHjK/view?usp=sharing",
    "https://drive.google.com/file/d/19bic7Zxb_70nTEdwU73gAZ2DFRt8Libd/view?usp=sharing",
    "https://drive.google.com/file/d/1ledzUN9yPjmtTN91cOV64IIRlbFpQ_DX/view?usp=sharing",
    "https://drive.google.com/file/d/138zq5bJEOEmizEAiAthj7Ye-vXS3z4zz/view?usp=sharing",
    "https://drive.google.com/file/d/1KXr0JwH4GOtxjmreNmpmpsZEwUMTgVh5/view?usp=sharing",
    "https://drive.google.com/file/d/1LOwya1LJ5ANz710_8TZN24Wn8ULctPm9/view?usp=sharing",
    "https://drive.google.com/file/d/1hZK-zso8JtiCMcFGJSb3nmHF7WIqrzdd/view?usp=sharing",
    "https://drive.google.com/file/d/1XypiBwUQ194ayefLVrGTlm8-PXjRDzXB/view?usp=sharing",
    "https://drive.google.com/file/d/1NHfhacApFgo8Ns6ncpNKN-zZdInTYLzA/view?usp=sharing",
    "https://drive.google.com/file/d/1e_W69J7ftQ85GQz2eI_o__oPTJQA22nK/view?usp=sharing",
    "https://drive.google.com/file/d/1eX9xtotGsMLwm41LFvA_4H7kbZwnpubX/view?usp=sharing",
    "https://drive.google.com/file/d/1M5wbsTUEVVwKhoY0lrgoYpbFc2IdRcWT/view?usp=sharing",
    "https://drive.google.com/file/d/1Ti5oGbFot7IklLvNnritUqtNv-dpCKgO/view?usp=sharing",
    "https://drive.google.com/file/d/1ewcKT8sxqMaCcdHW6shFgKOgVAZ2CUBH/view?usp=sharing",
    "https://drive.google.com/file/d/1psN2pzBCQECxP89scOBV0iMk-lYgoPT7/view?usp=sharing",
    "https://drive.google.com/file/d/1bG7GjI3ExZ9kjb0pgDIC0oesq4aWvi3m/view?usp=sharing",
    "https://drive.google.com/file/d/1OhbyUUwrkc1ceNNZBWVFkmna276I4wNg/view?usp=sharing",
    "https://drive.google.com/file/d/1TouJGFLrwHwQ7m_dUcOCNUPrOEmUjDh-/view?usp=sharing",
    "https://drive.google.com/file/d/19KdWgVkakPPvYD5IlDjIovHDO7aNEBQu/view?usp=sharing",
    "https://drive.google.com/file/d/1bk4WVkF9pi49waK7MBxaibufz8dEeTs4/view?usp=sharing",
    "https://drive.google.com/file/d/1NO0BlopX4MsEtJlSrE86s7qUp6q439ee/view?usp=sharing",
    "https://drive.google.com/file/d/1iou4XcVs0_2Riq8zeESOrU_CRy3JKj3O/view?usp=sharing",
    "https://drive.google.com/file/d/1VJf436ImKuy3eoqxpcDcZ87kdGs0wVMT/view?usp=sharing",

    /* 423 sin foto */
    "dd",
    /* 424-470 */
    "https://drive.google.com/file/d/1jKnvdPM1IgyCXDxtPyi_dUvZQiNaHpOl/view?usp=sharing",
    "https://drive.google.com/file/d/1EkT-ut3ICC56xXSlxpVXqRdiV6Pck_02/view?usp=sharing",
    "https://drive.google.com/file/d/1gnlxY4ifLoEONmw1AK_Q8Fo1dqPlfdW3/view?usp=sharing",
    "https://drive.google.com/file/d/17TWZ0Wfov-kkxS2Mzk_IxxzVYKUM8pqd/view?usp=sharing",
    "https://drive.google.com/file/d/1Bh0CrMEGGWuflqoLtQYePFADgaZIA8fA/view?usp=sharing",
    "https://drive.google.com/file/d/1pydOLyExDWIcm4n769-aN7q-HU7WjKrZ/view?usp=sharing",
    "https://drive.google.com/file/d/1VijVjJq3tqHYbyMSv-jSzs1CUhFQ2i2B/view?usp=sharing",
    "https://drive.google.com/file/d/17ApcAnuBQ3a7n1Ept64WxgWJ8L38v7D0/view?usp=sharing",
    "https://drive.google.com/file/d/1PEk-jHRhwsfw0n01vzKo-dXwA9qijAnG/view?usp=sharing",
    "https://drive.google.com/file/d/1rpOscmzfT8yWBRe1llzMQinS0Xag9DhI/view?usp=sharing",
    "https://drive.google.com/file/d/17oCIyP-Xa1_AN7ycQ6gfMlh6hbtHBCIV/view?usp=sharing",
    "https://drive.google.com/file/d/1Db1gHPIDQ1edqAXMxGRl55DaCo1CYXwA/view?usp=sharing",
    "https://drive.google.com/file/d/15PXnlCAcw5gjRD4dXiIqFkmRIcjcUx7X/view?usp=sharing",
    "https://drive.google.com/file/d/1hHcW3qp2d_JvfH7OiJeWLiQT3x9MESpX/view?usp=sharing",
    "https://drive.google.com/file/d/1-JEGiG4HtbItBbbK5rlBtocP5DH3UPkv/view?usp=sharing",
    "https://drive.google.com/file/d/196EokAcwsJYjL-GIbPjaTHvt4rsz0ZDJ/view?usp=sharing",
    "https://drive.google.com/file/d/1OOMYhFmsa5LCe2RoZov1Faxer2kVwbuU/view?usp=sharing",
    "https://drive.google.com/file/d/1Nn_V7yRGDqF8GTI7PIiJgD7vxX0OB7u_/view?usp=sharing",
    "https://drive.google.com/file/d/1vHHZPkIR4ViKW8VtI7YRqxfZn5RCdTRQ/view?usp=sharing",
    "https://drive.google.com/file/d/1KTVAk7jMnNttx4W3gFpk88Ttm2hNBIoO/view?usp=sharing",
    "https://drive.google.com/file/d/1b51I_NI1QRpCGxf-Kt4gN2-pB_wrXfRt/view?usp=sharing",
    "https://drive.google.com/file/d/1LJ9krIXgEh2PDDLZQ2N0WKsTx8PX4sjN/view?usp=sharing",
    "https://drive.google.com/file/d/1Cm-5bqFJLSK619n44WRvEuohk2emseKd/view?usp=sharing",
    "https://drive.google.com/file/d/1avehbtgUzKjMbDkoveQ8EulX7IbsXtYY/view?usp=sharing",
    "https://drive.google.com/file/d/1PU8WTFALHsKq0SQ5vjdyh1In-snMTHbG/view?usp=sharing",
    "https://drive.google.com/file/d/17cB8EYnLcJDdNa-thNK49XCcoZLeHOqE/view?usp=sharing",
    "https://drive.google.com/file/d/1xkw-xH05I46YgbZy3MzLXuPFY9iKHbiC/view?usp=sharing",
    "https://drive.google.com/file/d/1acymllPglx30Lb8YeChDUUk3K6XBNTdD/view?usp=sharing",
    "https://drive.google.com/file/d/1lvXA5r1sBTHneJ8wpXz44MLSa8sWyNyY/view?usp=sharing",
    "https://drive.google.com/file/d/1i_OZ0Iz1__c98jfEQoTcqD3SP5BuU1Id/view?usp=sharing",
    "https://drive.google.com/file/d/1LVPTyPk7pWahAuxTLvzRv6a5AbqPdBK4/view?usp=sharing",
    "https://drive.google.com/file/d/1mwfzRXcwd_FhiPXVIzTcz4z4tPl83qnA/view?usp=sharing",
    "https://drive.google.com/file/d/1gAx2CIH5B4Zu2jZfZ0I_HPkfzJf_PK_a/view?usp=sharing",
    "https://drive.google.com/file/d/1L7Rgurt-3LF72cntsDQkQ2pbEiRpPc_5/view?usp=sharing",
    "https://drive.google.com/file/d/1VRWijwjOussxfFhUsKq2LWq-9_sjPXH9/view?usp=sharing",
    "https://drive.google.com/file/d/1EcmG8tPRRQyecMBTBMBy9Yt8tVuA7Gmi/view?usp=sharing",
    "https://drive.google.com/file/d/1DmEiRwjzZcvnjA_KqcVVpTvAIR0h_FY8/view?usp=sharing",
    "https://drive.google.com/file/d/18BEiEEzjrLQQ3LG2rjTJE_C9UeU7SCev/view?usp=sharing",
    "https://drive.google.com/file/d/1_BAm8jq0s-v5ldMgdkoOals3SDAZLpac/view?usp=sharing",
    "https://drive.google.com/file/d/1Z8o8Mdl1BuG_8mlX74C4KvthwBUVaUm3/view?usp=sharing",
    "https://drive.google.com/file/d/1woTpp0DIG0u-pbSmpCkN9erAAcz2AmXt/view?usp=sharing",
    "https://drive.google.com/file/d/1dhiB-jDjQsiUJzPtbGNJM0B6zUBIIgD9/view?usp=sharing",
    "https://drive.google.com/file/d/1cc53hJftobp6CU2AhsXkjuZsZTfk9ytE/view?usp=sharing",
    "https://drive.google.com/file/d/1BJxHmluLMnTyw9moC4kyEjrzqPOPMH8u/view?usp=sharing",
    "https://drive.google.com/file/d/1CeaZI6x6QduF5UI3tk6UmHVv2IGYXs7R/view?usp=sharing",
    "https://drive.google.com/file/d/1qSFO6T7K9muzcBgYUXWHeLMnXXFHDVjd/view?usp=sharing",
    "https://drive.google.com/file/d/10GaYBrpCl4OVpzpkylNxM1FlPeTfQuwh/view?usp=sharing",

    /* 471-515 sin foto */
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",
    "dd",

    /* 516-613 */
    "https://drive.google.com/file/d/11WoY8mxnum9Nswk8sSik6O3tVaq6GTVP/view?usp=sharing",
    "https://drive.google.com/file/d/1haxx-rRrDhcLTJAASCqwQFZRfP0AVv_I/view?usp=sharing",
    "https://drive.google.com/file/d/1pyBuLYJO-vK_nq5eperulylDQ-NFwu6g/view?usp=sharing",
    "https://drive.google.com/file/d/1wqaF9dAnTc8oYGdbco4ZZbhNCuBe_Yie/view?usp=sharing",
    "https://drive.google.com/file/d/1qwmtbUKRar4iybSHrh2GXtl_YSUxlKN1/view?usp=sharing",
    "https://drive.google.com/file/d/1qRiV2z_SJtPO81GDG40ilVZD6_B2vl7H/view?usp=sharing",
    "https://drive.google.com/file/d/10B6zgl_5ZzjS6yMsvQl4U-yJnqK2zSO1/view?usp=sharing",
    "https://drive.google.com/file/d/1-Za_OZT5htfrZKu8QB_Xs1R6FLVDSvKK/view?usp=sharing",
    "https://drive.google.com/file/d/1k1jmEB3A2kBglXcc7oae9EFv67C9p7PN/view?usp=sharing",
    "https://drive.google.com/file/d/1M5AFkSVF0Okz2DdV_RvjScMnZRofkNLe/view?usp=sharing",
    "https://drive.google.com/file/d/1CZjkwwiYiM4ijzQvTLjUXHA4OZbKRrGG/view?usp=sharing",
    "https://drive.google.com/file/d/13W2z5qnEEkt5nK9_Yd0GiczJqBykTgyM/view?usp=sharing",
    "https://drive.google.com/file/d/1DK7t4KP-E0bE-kKYSiDwvnh200HRK4W7/view?usp=sharing",
    "https://drive.google.com/file/d/1UYmecQ4ApKidAqGMsphOZBqseScClWYI/view?usp=sharing",
    "https://drive.google.com/file/d/1isig5SwdoXnugkSV1XdIdtVJ25eh-VBO/view?usp=sharing",
    "https://drive.google.com/file/d/1dQ_ojgaqttRsNAIH8-rZHMQlSNvyLbZ1/view?usp=sharing",
    "https://drive.google.com/file/d/1mUHh1GyUFOm5pntVRBASyOto5eWxOv7-/view?usp=sharing",
    "https://drive.google.com/file/d/1lGR_psc8OtmGKZGuao4Rz-G83EZ51qzr/view?usp=sharing",
    "https://drive.google.com/file/d/1XCYdzkkQdsnM6fRjsgTuytx2jtsbb5P0/view?usp=sharing",
    "https://drive.google.com/file/d/1JRVVFm1gYRDRohZ8FJgtO3g8rhPiwcqf/view?usp=sharing",
    "https://drive.google.com/file/d/1OzAoo2NpuOqgmdWp99K3WRix46gpwiJZ/view?usp=sharing",
    "https://drive.google.com/file/d/1HWOznRSy3oZ4D4-KYSzE77j2yAK7A3QH/view?usp=sharing",
    "https://drive.google.com/file/d/1hk0QEcTZs01N5zjOrgV19igSlCOZoCGy/view?usp=sharing",
    "https://drive.google.com/file/d/1VI4q_Bh9B0WvlJ0j-9TaS9ZyBxVoYZE_/view?usp=sharing",
    "https://drive.google.com/file/d/1GalwR-uPChamqWaNxOWfO5xpoV3cVvEb/view?usp=sharing",
    "https://drive.google.com/file/d/1fDUymfK5VSQCW8tOlKv6YbdyqRtmwhDy/view?usp=sharing",
    "https://drive.google.com/file/d/1E-9G7PXDu4OLVYYtwYLu2rKaUpqKtGaI/view?usp=sharing",
    "https://drive.google.com/file/d/1zSBNW12-x-uY_jikSO1Q4eWvAdF3V2pS/view?usp=sharing",
    "https://drive.google.com/file/d/1852ki3nxB9vRRLluebQRmkOKIWvWEWXK/view?usp=sharing",
    "https://drive.google.com/file/d/1-whGKQv_SXEMRpcA5QrIXxSRE7l7OnUl/view?usp=sharing",
    "https://drive.google.com/file/d/1Fgtn_Nar7M7YDcScUJtjfCQfbQq9kXcK/view?usp=sharing",
    "https://drive.google.com/file/d/1iZfu-aBYCSHPAh7JeAjzQ9gSZXvd0QQA/view?usp=sharing",
    "https://drive.google.com/file/d/1SxjwKoeN6_d8QLATL0d7on9Hqee_F4iu/view?usp=sharing",
    "https://drive.google.com/file/d/1mujLlbGCgVD97JL95EnqCysBOiXM45uK/view?usp=sharing",
    "https://drive.google.com/file/d/1iPwQS3m4XwoL4KgN_Rwr1ArV5Xoun6hC/view?usp=sharing",
    "https://drive.google.com/file/d/1mmLWv-gDO64BelswfR2dM-_mJzIyocD6/view?usp=sharing",
    "https://drive.google.com/file/d/1UMqPH09DUEcvt9d2zb8-OCSZKl5BYtuP/view?usp=sharing",
    "https://drive.google.com/file/d/1kzBQt1xQ8ByZPjABWQdf5G9dttn3uPUR/view?usp=sharing",
    "https://drive.google.com/file/d/15g7QLK7wqdBLO0r64LPU5-A0dBu3uIwm/view?usp=sharing",
    "https://drive.google.com/file/d/13tD1RfI786lTsEVNWMJAvfSP64jvsaLk/view?usp=sharing",
    "https://drive.google.com/file/d/1nOngM8H9CxhVWIkzfJ4cmJPR4kmDRIua/view?usp=sharing",
    "https://drive.google.com/file/d/1Rw3C5CiTLa0_vQrxpD-LJ9IxS-6lIxZd/view?usp=sharing",
    "https://drive.google.com/file/d/1Zcc7a7MBlDCvEtECcJIsRJTNUKX_CXn4/view?usp=sharing",
    "https://drive.google.com/file/d/1aQYWjb3CIbD30I5zvLAU350gO22vdnhv/view?usp=sharing",
    "https://drive.google.com/file/d/1yldE9FkxtkCbBxlYdX2GIwMZ7uqwK8hk/view?usp=sharing",
    "https://drive.google.com/file/d/1_0OJVn5d_JL3rwvKT47G60CRyE8xDRwL/view?usp=sharing",
    "https://drive.google.com/file/d/1j83B4XSlE18jRf6AfEQglPdjMQH8M70p/view?usp=sharing",
    "https://drive.google.com/file/d/173eaLRzNAIYMbUwSk0BinyXYbLIRpPDW/view?usp=sharing",
    "https://drive.google.com/file/d/1ynDQqyx8PXAMVRyz0oMePP93BHaQm_ex/view?usp=sharing",
    "https://drive.google.com/file/d/1j1Nms3LmBFzgivrS6VQ7AEzXxqHAg_1w/view?usp=sharing",
    "https://drive.google.com/file/d/1dd705eGIW6fllpkr-KVCoQsrd1dbaO4r/view?usp=sharing",
    "https://drive.google.com/file/d/1A5oUAnno6LFeh5rWj0eJdLEyGklWwjcd/view?usp=sharing",
    "https://drive.google.com/file/d/1rrYN_UvEA4bdjV9WWRiT5GAyauUc9EUb/view?usp=sharing",
    "https://drive.google.com/file/d/1yoeePNgVcHPWwYVxue-7CSbnDS6L2f6o/view?usp=sharing",
    "https://drive.google.com/file/d/1mLGISw5IhRkqiubRbWyFr6b5cCUyh9S3/view?usp=sharing",
    "https://drive.google.com/file/d/14PLcdcFgM2UzlfZrhuIolnXdBCbk9gFo/view?usp=sharing",
    "https://drive.google.com/file/d/1LL70vVF6OAHYJw3Yzr0US2IHLx7KiypA/view?usp=sharing",
    "https://drive.google.com/file/d/1zTP4CtwfO1kMYFO68CbgWGFueXAEgMOk/view?usp=sharing",
    "https://drive.google.com/file/d/1ZyDAHQ_F1K3Gt90wlqlRda8BueJxlA5O/view?usp=sharing",
    "https://drive.google.com/file/d/1iHZPpfu3tAh9m8fIIR6nb0BniM-wALKH/view?usp=sharing",
    "https://drive.google.com/file/d/1GuhzhTKYYjYUbHvgwHMiJECpWIC05ja1/view?usp=sharing",
    "https://drive.google.com/file/d/1qiiDxttF2Stw3W_cLsTBJ1C1fPFG-7e-/view?usp=sharing",
    "https://drive.google.com/file/d/1RcpaXth8u29DeD69xA56oZkafNKYZr_0/view?usp=sharing",
    "https://drive.google.com/file/d/1U5vO3hE44YvWk7Lawq-wZZAGLC_kU5ZN/view?usp=sharing",
    "https://drive.google.com/file/d/1wN-41TKF77n4RfV7fuNYIS6M_GsyKqXU/view?usp=sharing",
    "https://drive.google.com/file/d/162oYd7sNAsjqgiyhYXRx_KC0h8qgsd4Z/view?usp=sharing",
    "https://drive.google.com/file/d/19E1WLjB4cSgdXkBZOXQLHfgnpBBz4FGB/view?usp=sharing",
    "https://drive.google.com/file/d/1RYrucQlMZPsDm2BqeMuQ9Yqk12n5GrUU/view?usp=sharing",
    "https://drive.google.com/file/d/1FD2id0QZZMeBpIoEolHcGOO0KLOb-kzE/view?usp=sharing",
    "https://drive.google.com/file/d/1l2KRi0AxwKCsjw4Xesro41K7_VlzqQlH/view?usp=sharing",
    "https://drive.google.com/file/d/1yQ2CfRJaPUtGYtkuoJBoGvBuMt-Yb04n/view?usp=sharing",
    "https://drive.google.com/file/d/1ePfKj97JrpnXFxbcObUmoxTJ9tI1WRTQ/view?usp=sharing",
    "https://drive.google.com/file/d/1fhzmq4eZORvQ0-0Vo4LzQZHON6qWnBMm/view?usp=sharing",
    "https://drive.google.com/file/d/1QEDlWue8bF41KRO1c1Ovo9f_HAno7TgT/view?usp=sharing",
    "https://drive.google.com/file/d/19aJQhTPejCbexvzcWMejcvkZYUHZBoir/view?usp=sharing",
    "https://drive.google.com/file/d/1zFBRvBaq2bWN-dWbAeQmlcEjTNE115VB/view?usp=sharing",
    "https://drive.google.com/file/d/1jqoeB0o4eu_lBmYyl58ttcMyQ_AVO15M/view?usp=sharing",
    "https://drive.google.com/file/d/1ZZ0LOvT5CRgKJcKZC5xQ6WTJ5-h2Ktzl/view?usp=sharing",
    "https://drive.google.com/file/d/1syaH7U1pyRrdIKVIJdvRNMuGQ_pzF-iv/view?usp=sharing",
    "https://drive.google.com/file/d/1qOpN2JXYqBMYUEtN7GZZJid9NwgCO3ZA/view?usp=sharing",
    "https://drive.google.com/file/d/1ive_NnCpbcAX-mIoH57uK-I-Pj5hod8I/view?usp=sharing",
    "https://drive.google.com/file/d/1R7NgNZROImRBJ-xTR4XVmwLW7orWhj1X/view?usp=sharing",
    "https://drive.google.com/file/d/1p04ufhrNqGAsElFUp_APabVtvi8qM4xb/view?usp=sharing",
    "https://drive.google.com/file/d/1owvtStDDqLSyl58aMdFiV9hOQUR8EKOX/view?usp=sharing",
    "https://drive.google.com/file/d/1_b5MZujWTxd9fAKX7M7FkumWBOflD5s6/view?usp=sharing",
    "https://drive.google.com/file/d/1NuDB4V2pWHrol6dka9mQcAWaXH2uHOeO/view?usp=sharing",
    "https://drive.google.com/file/d/178wotGOzbK2ONkkf7Dg-HgynANS1vx5n/view?usp=sharing",
    "https://drive.google.com/file/d/1ykoqvPWysyLmXqAou29MRQ5MfKc8moyk/view?usp=sharing",
    "https://drive.google.com/file/d/16ejkoA0TY-LjtQ37hlRTmuLfdSaRFjgq/view?usp=sharing",
    "https://drive.google.com/file/d/1CeTmK2DpxDhiIKdlUX6EQ_sqaifU3DDU/view?usp=sharing",
    "https://drive.google.com/file/d/1HiszLDLN1lVI4-4DNBzjvRCD0O2-jzXf/view?usp=sharing",
    "https://drive.google.com/file/d/15EibRbyvyvyor0P3Koy8E1JpDx3SQp0a/view?usp=sharing",
    "https://drive.google.com/file/d/1-SNvIefy9jeJj_iH4WUtKCQPYLXf-6oo/view?usp=sharing",
    "https://drive.google.com/file/d/1WsyR6qulCHKciccSwquwKBeydM9njFGm/view?usp=sharing",
    "https://drive.google.com/file/d/1DrcGgP2itZcXdVUaDxpjU6Llw2k_9Qlc/view?usp=sharing",
    "https://drive.google.com/file/d/1OXfxXnR9fR7ODb5IsHwrdppH0es7EQNT/view?usp=sharing",
    "https://drive.google.com/file/d/1oNXd2EBCazpxxbgpH_gKRTpdPApU8Edz/view?usp=sharing",
    "https://drive.google.com/file/d/1VwmusoUtZ_UsLgGhJ1laZkrpb5EG14U_/view?usp=sharing",
];


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
            
            imgTag.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            
            title.textContent = nombre;
            modal.style.display = 'flex';
            
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
    document.getElementById('refaccionImg').src = ""; 
}

window.onclick = function(e) {
    const tableModal = document.getElementById('tableModal');
    const imageModal = document.getElementById('imageModal');
    if(e.target == tableModal) closeModal();
    if(e.target == imageModal) closeImageModal();
}