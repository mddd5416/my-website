// manage_panel_script.js

// 1. الإعدادات والربط
const SB_URL = 'https://ibqvftckjsyfnyembggc.supabase.co';
const SB_KEY = 'F3mh2H56GV_fVlg81gDRDA_cpKDnYt_'; // تأكد من المفتاح الكامل هنا
const sb = supabase.createClient(SB_URL, SB_KEY);

// 2. حماية الصفحة: التأكد من وجود الجلسة
(function checkAuth() {
    if (!sessionStorage.getItem('manager_access_token')) {
        window.location.replace('Manager_login_page.html');
    } else {
        document.getElementById('main-wrapper').style.display = 'grid';
    }
})();

// 3. التبديل بين الأقسام
function showSec(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
}

// 4. تحديث بيانات المانجر (اليوزر والباسورد)
async function updateAdminAuth() {
    const newUser = document.getElementById('new-admin-user').value;
    const newPass = document.getElementById('new-admin-pass').value;

    if(!newUser || !newPass) return alert("املأ الحقول أولاً");

    const { error } = await sb
        .from('admin_settings')
        .update({ admin_user: newUser, admin_pass: newPass })
        .eq('id', 1);

    if (error) alert("حدث خطأ أثناء التحديث");
    else alert("تم تحديث بيانات المانجر بنجاح! سيتم تطبيقها في الدخول القادم.");
}

// 5. تحديث كلمة سر الزوار
async function updateInviteAuth() {
    const newInvPass = document.getElementById('new-invite-pass').value;

    if(!newInvPass) return alert("أدخل كلمة السر الجديدة");

    const { error } = await sb
        .from('admin_settings')
        .update({ invite_pass: newInvPass })
        .eq('id', 1);

    if (error) alert("حدث خطأ");
    else alert("تم تغيير كلمة سر الزوار بنجاح.");
}

function logout() {
    sessionStorage.clear();
    window.location.replace('Manager_login_page.html');
}
