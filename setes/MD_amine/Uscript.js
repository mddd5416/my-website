const supabaseUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';
const sb = supabase.createClient(supabaseUrl, supabaseKey);

// دالة تصحيح الروابط لمنع تداخلها مع GitHub
function formatURL(url) {
    if (!url) return "#";
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
    }
    return formatted;
}

async function loadProjects() {
    const { data } = await sb.from('projects').select('*').order('id', { ascending: false });
    const list = document.getElementById('projects-list');
    
    if (data) {
        list.innerHTML = data.map(p => `
            <div class="card">
                <div>
                    <div class="card-header">
                        <img src="${p.icon_url || 'https://www.gstatic.com/images/branding/product/1x/generic_64dp.png'}" class="proj-icon">
                        <span class="proj-type">${p.type || 'مشروع'}</span>
                    </div>
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                </div>
                <div>
                    <div class="stats">
                        <span>👁️ ${p.views || 0} مشاهدة</span>
                        <span>📥 ${p.downloads || 0} تفاعل</span>
                    </div>
                    <a href="${formatURL(p.link)}" class="btn" onclick="updateCount(${p.id}, ${p.downloads || 0})" target="_blank">
                        ${p.btn_text || 'عرض التفاصيل'}
                    </a>
                </div>
            </div>
        `).join('');
    }
}

async function updateCount(id, current) {
    await sb.from('projects').update({ downloads: current + 1 }).eq('id', id);
}
window.onload = loadProjects;
