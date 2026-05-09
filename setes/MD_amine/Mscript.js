let client = null;
const sUrl = 'https://ibqvftckjsyfnyembggc.supabase.co';
const sKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlicXZmdGNranN5Zm55ZW1iZ2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDI3OTUsImV4cCI6MjA5MzkxODc5NX0.EQNGQz5ckjFa-2b0sFpZ6AWhWkYDl0YP5noN7vAcGK4';

function unlock() {
    const pass = document.getElementById('access-key').value;
    if (pass === "MDaMiNeLD") {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        client = supabase.createClient(sUrl, sKey);
        renderAdminList(); // عرض قائمة المشاريع للحذف
    } else {
        alert("ACCESS DENIED!");
    }
}

async function pushData() {
    const projectData = {
        title: document.getElementById('p-title').value,
        desc: document.getElementById('p-desc').value,
        link: document.getElementById('p-link').value,
        type: document.getElementById('p-type').value, // موقع، بوت، تطبيق...
        icon_url: document.getElementById('p-icon').value,
        tech: document.getElementById('p-tech').value
    };

    const { error } = await client.from('projects').insert([projectData]);
    if (!error) {
        alert("تم النشر بنجاح!");
        location.reload();
    } else {
        alert("خطأ: " + error.message);
    }
}

async function deleteProject(id) {
    if(confirm("هل أنت متأكد من حذف هذا المشروع نهائياً؟")) {
        const { error } = await client.from('projects').delete().eq('id', id);
        if(!error) location.reload();
    }
}

async function renderAdminList() {
    const { data } = await client.from('projects').select('*');
    const adminList = document.getElementById('admin-list');
    adminList.innerHTML = data.map(p => `
        <div style="border: 1px solid #333; padding: 10px; margin-top: 10px; display: flex; justify-content: space-between;">
            <span>${p.title} (${p.type})</span>
            <button onclick="deleteProject(${p.id})" style="background: red; width: auto; padding: 5px 10px;">حذف</button>
        </div>
    `).join('');
}
