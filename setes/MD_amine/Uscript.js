const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

let allProjects = [];

async function loadProjects() {
    const { data } = await sb.from('projects').select('*').order('id', { ascending: false });
    if (data) {
        allProjects = data;
        renderGrid();
    }
}

function renderGrid() {
    const list = document.getElementById('projects-list');
    list.innerHTML = allProjects.map(p => `
        <div class="card" onclick="expandProject(${p.id})">
            <img src="${p.icon_url || ''}" class="proj-icon">
            <h3>${p.title}</h3>
            <p class="summary">${p.desc}</p>
        </div>
    `).join('');
}

function expandProject(id) {
    const p = allProjects.find(item => item.id === id);
    const view = document.getElementById('expanded-view');
    const dataDiv = document.getElementById('expanded-data');
    
    view.style.display = 'block';
    dataDiv.innerHTML = `
        <img src="${p.icon_url || ''}">
        <h2>${p.title}</h2>
        <span style="color:var(--accent)">${p.type}</span>
        <p style="font-size:18px; line-height:1.6">${p.desc}</p>
        <div class="stats">👁️ ${p.views} | 📥 ${p.downloads}</div>
        <a href="${p.link.startsWith('http') ? p.link : 'https://'+p.link}" class="btn" target="_blank">${p.btn_text}</a>
    `;
}

function closeExpanded() {
    document.getElementById('expanded-view').style.display = 'none';
}

window.onload = loadProjects;
