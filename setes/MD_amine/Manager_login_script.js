<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول | ROOT Manager</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --google-blue: #1a73e8;
            --google-gray: #5f6368;
            --google-border: #dadce0;
            --bg-color: #ffffff;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Noto Sans Arabic', sans-serif; }

        body {
            background-color: var(--bg-color);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
        }

        .login-card {
            width: 100%;
            max-width: 450px;
            padding: 48px 40px 36px;
            border: 1px solid var(--google-border);
            border-radius: 8px;
            text-align: center;
        }

        .brand-logo {
            font-size: 24px;
            font-weight: 500;
            color: #202124;
            margin-bottom: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
        }

        .brand-logo span { color: var(--google-blue); font-weight: 700; }

        h1 { font-size: 24px; font-weight: 400; color: #202124; margin-bottom: 8px; }
        p { color: #202124; font-size: 16px; margin-bottom: 40px; }

        .input-container {
            position: relative;
            margin-bottom: 24px;
            text-align: right;
        }

        input {
            width: 100%;
            padding: 13px 15px;
            font-size: 16px;
            border: 1px solid var(--google-border);
            border-radius: 4px;
            outline: none;
            transition: border 0.2s;
        }

        input:focus {
            border: 2px solid var(--google-blue);
            padding: 12px 14px;
        }

        .actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 40px;
            flex-direction: row-reverse;
        }

        .btn-next {
            background-color: var(--google-blue);
            color: #fff;
            border: none;
            padding: 10px 24px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: box-shadow 0.2s;
        }

        .btn-next:hover { box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15); }
        .btn-next:disabled { background-color: #ccc; cursor: not-allowed; }

        .forgot-link {
            color: var(--google-blue);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="brand-logo"><span>ROOT</span> Manager</div>
        <h1>تسجيل الدخول</h1>
        <p>مرحباً بك مجدداً في لوحة التحكم</p>

        <div class="input-container">
            <input type="text" id="manager-user" placeholder="اسم المستخدم">
        </div>

        <div class="input-container">
            <input type="password" id="manager-pass" placeholder="كلمة المرور">
        </div>

        <div class="actions">
            <button class="btn-next" id="loginBtn">دخول</button>
            <div class="forgot-link">نسيت كلمة المرور؟</div>
        </div>
    </div>

    <script src="Manager_login_script.js"></script>
</body>
</html>
