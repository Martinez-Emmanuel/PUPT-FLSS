<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculty Preferences Submission</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap');

        body {
            margin: 0;
            padding: 20px;
            background-color: #fff5f5;
            font-family: 'Inter Tight', Arial, sans-serif;
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

        .deadline-box {
            background-color: rgb(242, 224, 224);
            border-left: 6px solid #800000;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 6px;
        }

        .deadline-text {
            color: #800000;
            font-weight: 500;
            margin: 0;
        }

        .button-container {
            text-align: center;
            margin: 35px 0;
        }

        .button {
            background-color: #800000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 9999px;
            font-size: 16px;
            font-weight: 500;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(128, 0, 0, 0.1);
        }

        .button:hover {
            background-color: #660000;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(128, 0, 0, 0.2);
        }

        .important-note {
            font-size: 14px;
            color: #666666;
            font-style: italic;
            margin-top: 20px;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #666666;
            padding: 25px 40px;
            background-color: #ffffff;
        }

        .footer-divider {
            border-top: 1px solid #e0e0e0;
            margin: 20px 0;
        }

        .contact-info {
            margin-bottom: 15px;
        }

        .contact-info a {
            color: #800000;
            text-decoration: none;
            font-weight: 500;
        }

        .contact-info a:hover {
            text-decoration: underline;
        }

        .copyright {
            font-size: 13px;
            color: #888888;
            font-weight: 400;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://images.pupt-flss.com/pup_logo_white_bg.png" alt="PUP Logo" class="logo">
            <h1>Faculty Loading and Scheduling System</h1>
        </div>

        <div class="content">
            <p class="greeting"><b>Dear {{ $faculty_name }},</b></p>

            <p>We hope this email finds you well. The Faculty Loading and Scheduling System is <b>now open</b> for the
                submission of your teaching preferences, subject selections, and schedule preferences for the upcoming
                semester.</p>

            <div class="deadline-box">
                <p class="deadline-text">Submission Deadline: {{ $deadline }}</p>
                @if ($days_left !== null)
                    <p class="deadline-text">Time Remaining: {{ $days_left }} {{ $days_left == 1 ? 'day' : 'days' }}
                    </p>
                @endif
            </div>

            <p>Your input is crucial in helping us create an optimal teaching schedule that accommodates both faculty
                preferences and institutional requirements. Please ensure to submit your preferences before the deadline
                to have them considered in the scheduling process.</p>

            <div class="button-container">
                <a href="https://pupt-flss.com" class="button">Submit Preferences Now</a>
            </div>

            <p class="important-note">Note: If you experience any technical difficulties or have questions about the
                submission process, please don't hesitate to contact our support team.</p>
        </div>

        <div class="footer">
            <div class="contact-info">
                <strong>Need Assistance?</strong><br>
                Email: <a href="mailto:pupt.flss2025@gmail.com">pupt.flss2025@gmail.com</a><br>
                Office Hours: Monday to Friday, 8:00 AM - 5:00 PM
            </div>

            <div class="footer-divider"></div>

            <p class="copyright">
                © 2024 Polytechnic University of the Philippines - Taguig Branch<br>
                Faculty Loading and Scheduling System<br>
                All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>
