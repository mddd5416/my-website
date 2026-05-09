const _SB_URL = 'https://ibqvftckjsyfnyembggc.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(_SB_URL, _SB_KEY);

async function startClient() {
    const { data, error } = await sb.from('projects').select('*').order('created_at', { ascending: false });
    const grid = document.getElementById('client-view-grid');
    
    if (data) {
        grid.innerHTML = data.map(p => `
            <div class="app-card">
                <div class="app-head">
                    <img src="${p.icon_url || 'https://via.placeholder.com/64'}" class="app-icon">
                    <div class="app-info">
                        <h3>${p.title}</h3>
                        <span class="app-tag">${p.type}</span>
                    </div>
                </div>
                <p class="app-desc">${p.desc}</p>
                <a href="${p.link}" class="dl-btn" target="_blank" onclick="logDownload('${p.id}')">
                    ${p.btn_text || 'تحميل الآن'}
                </a>
            </div>
        `).join('');
    }
}

async function logDownload(id) {
    // كود اختياري لزيادة عداد التحميل في قاعدة البيانات
    await sb.rpc('increment_downloads', { row_id: id });
}

startClient();
