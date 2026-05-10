// Manager_login_script.js

// 1. إعدادات الاتصال بـ Supabase (ضع بياناتك هنا)
const SB_URL = 'https://your-project-id.supabase.co';
const SB_KEY = 'your-anon-key';
const sb = supabase.createClient(SB_URL, SB_KEY);

// 2. محرك التحقق من الدخول
document.getElementById('loginBtn').addEventListener('click', async () => {
    const userInput = document.getElementById('manager-user').value;
    const passInput = document.getElementById('manager-pass').value;
    const btn = document.getElementById('loginBtn');

    if (!userInput || !passInput) {
        alert("يرجى ملء كافة الحقول");
        return;
    }

    btn.disabled = true;
    btn.innerText = "جاري التحقق...";

    try {
        // جلب بيانات المسؤول الحالية من جدول الإعدادات
        // هذا يضمن أنك إذا غيرت اليوزر أو الباسورد من الداخل، سيعمل هنا فوراً
        const { data, error } = await sb
            .from('admin_settings')
            .select('admin_user, admin_pass')
            .eq('id', 1) // السطر الوحيد الخاص بالمدير
            .single();

        if (error) throw error;

        // التحقق من المطابقة
        if (userInput === data.admin_user && passInput === data.admin_pass) {
            // إنشاء توكن الجلسة (لإخبار صفحة المانجر بانل أنك مسجل دخول)
            const sessionToken = btoa(userInput + ":" + Date.now());
            sessionStorage.setItem('manager_access_token', sessionToken);
            
            // الانتقال لصفحة لوحة التحكم
            window.location.href = 'manage_panel_page.html';
        } else {
            alert("اسم المستخدم أو كلمة المرور غير صحيحة");
            btn.disabled = false;
            btn.innerText = "دخول";
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("حدث خطأ في الاتصال بقاعدة البيانات");
        btn.disabled = false;
        btn.innerText = "دخول";
    }
});
