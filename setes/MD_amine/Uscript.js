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
                    <img src="${p.icon_url || 'https://via.placeholder.com/50'}" class="proj-icon">
                    <span class="proj-type">${p.type || 'مشروع'}</span>
                </div>
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
                <div class="stats">
                    <span>👁️ ${p.views || 0}</span>
                    <span>📥 ${p.downloads || 0}</span>
                </div>
                <a href="${p.link}" class="btn" onclick="registerDownload(${p.id}, '${p.link}')" target="_blank">تحميل / دخول</a>
            </div>
        `).join('');
        // زيادة عدد زوار الصفحة العامة لمرة واحدة
        updateGlobalViews();
    }
}

async function registerDownload(id, url) {
    // زيادة عداد التحميلات للمشروع المحدد
    const { data } = await sb.rpc('increment_downloads', { row_id: id });
}

window.onload = loadProjects;
