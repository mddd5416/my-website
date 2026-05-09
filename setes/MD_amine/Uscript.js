const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

async function loadProjects() {
    const { data, error } = await sb.from('projects').select('*').order('id', { ascending: false });
    const list = document.getElementById('projects-list');
    
    if (data) {
        list.innerHTML = data.map(p => `
            <div class="card">
                <div class="card-header">
                    <img src="${p.icon_url || 'https://cdn-icons-png.flaticon.com/512/1243/1243966.png'}" class="proj-icon">
                    <span class="proj-type">${p.type || 'مشروع'}</span>
                </div>
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
                <div class="stats">
                    <span>👁️ مشاهدات: ${p.views || 0}</span>
                    <span>📥 تحميلات: ${p.downloads || 0}</span>
                </div>
                <div>${p.tech ? p.tech.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : ''}</div>
                <a href="${p.link}" class="btn" onclick="registerAction(${p.id}, ${p.downloads || 0})" target="_blank">انتقال / تحميل</a>
            </div>
        `).join('');
    }
}

// زيادة عداد التحميلات (بسيط للتجربة)
async function registerAction(id, current) {
    await sb.from('projects').update({ downloads: current + 1 }).eq('id', id);
}

window.onload = loadProjects;
