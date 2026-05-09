const _U = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_U, _K);

async function fetchProjects() {
    const { data } = await sb.from('projects').select('*').order('created_at', { ascending: false });
    const grid = document.getElementById('client-grid');
    if (data) {
        grid.innerHTML = data.map(p => `
            <div class="card">
                <div class="card-img">
                    <img src="${p.icon_url || 'https://via.placeholder.com/160'}" alt="${p.title}">
                </div>
                <div class="card-content">
                    <div style="font-size:12px; color:#1a73e8; margin-bottom:5px;">${p.type}</div>
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc">${p.desc}</p>
                    <a href="${p.link}" class="btn-dl" target="_blank">${p.btn_text || 'تحميل'}</a>
                </div>
            </div>
        `).join('');
    }
}

fetchProjects();
