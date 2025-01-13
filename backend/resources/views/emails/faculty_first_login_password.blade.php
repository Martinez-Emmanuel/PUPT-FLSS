<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your FLSS Backup Account Password</title>
    <style type="text/css">
        /* [Previous CSS styles remain the same] */
        body {
            margin: 0;
            padding: 20px;
            background-color: #fff5f5;
            font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            line-height: 1.6;
        }

        .container {
            max-width: 650px;
            margin: 20px auto;
            background-color: rgb(248, 241, 241);
            padding: 0;
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        .header {
            text-align: center;
            padding: 30px 20px;
            background-color: #800000;
        }

        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 15px;
        }

        .header img {
            width: 5rem;
            height: auto;
        }

        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
            padding: 0;
        }

        .content {
            padding: 35px 40px;
            color: #2c3e50;
            font-size: 16px;
        }

        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #1a1a1a;
            font-weight: 500;
        }

        p {
            text-align: justify;
        }

        .password-container {
            text-align: center;
            margin: 35px 0;
        }

        .password-display {
            background-color: #800000;
            color: #ffffff !important;
            padding: 12px 24px;
            border-radius: 9999px;
            font-size: 18px;
            font-weight: 500;
            display: inline-block;
            box-shadow: 0 2px 4px rgba(128, 0, 0, 0.1);
        }

        .important-note {
            font-size: 14px;
            color: #666666;
            font-style: italic;
            margin: 0;
            padding-top: 20px;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #666666;
            padding: 15px 40px;
            background-color: rgb(239, 228, 228);
        }

        .important-note a {
            color: #800000;
            text-decoration: none;
            font-weight: 500;
        }

        .important-note a:hover {
            text-decoration: underline;
        }

        .copyright {
            text-align: center;
            font-size: 13px;
            color: rgb(132, 94, 94);
            font-weight: 400;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://images.pupt-flss.com/pup_logo_white_bg.png" alt="PUP Logo" class="logo">
            <h1>PUP Taguig</h1>
            <h1>Faculty Loading and Scheduling System</h1>
        </div>

        <div class="content">
            <p class="greeting"><b>Dear {{ $faculty_name }},</b></p>

            <p>Welcome to the PUP Taguig Faculty Loading and Scheduling System! Your account has been successfully
                created. We've also created a backup password for your FLSS account:</p>

            <div class="password-container">
                <span class="password-display">{{ $password }}</span>
            </div>

            <p><strong>What you need to know:</strong></p>
            <ul>
                <li>For security reasons, we recommend that you change this password after your first login.</li>
                <li>Keep your FLSS backup password safe - you'll only need it if the main login through PUP-HRIS is
                    unavailable.</li>
            </ul>

            <p class="important-note">Need help? Contact us at <a
                    href="mailto:pupt.flss2025@gmail.com">pupt.flss2025@gmail.com</a></p>
        </div>

        <div class="footer">
            <p class="copyright">
                © 2024 Polytechnic University of the Philippines - Taguig Branch<br>
                Faculty Loading and Scheduling System<br>
                All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>
