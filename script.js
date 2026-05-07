// التبديل بين النماذج
function toggleForm() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

// وظيفة إنشاء الحساب
function register() {
    const user = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    if (user && email && pass) {
        // حفظ البيانات في LocalStorage
        localStorage.setItem('userData', JSON.stringify({ user, pass }));
        alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
        toggleForm();
    } else {
        alert("يرجى ملء جميع الحقول.");
    }
}

// وظيفة تسجيل الدخول
function login() {
    const userInput = document.getElementById('loginUser').value;
    const passInput = document.getElementById('loginPass').value;
    
    // استرجاع البيانات المحفوظة
    const storedData = JSON.parse(localStorage.getItem('userData'));

    if (storedData && userInput === storedData.user && passInput === storedData.pass) {
        alert("أهلاً بك " + userInput + "! تم تسجيل الدخول بنجاح.");
        // هنا يمكنك توجيه المستخدم لصفحة أخرى
        // window.location.href = "dashboard.html"; 
    } else {
        alert("خطأ في اسم المستخدم أو كلمة المرور!");
    }
}