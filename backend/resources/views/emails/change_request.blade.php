<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculty Preference Change Request</title>
    <style type="text/css">
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap');

        body {
            margin: 0;
            padding: 20px;
            background-color: #fff5f5;
            font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
        }


        .container {
            max-width: 650px;
            margin: 20px auto;
            background-color: #f8f1f1;
            padding: 0;
            border-radius: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        /* Header Section */
        .header {
            text-align: center;
            padding: 30px 20px;
            background-color: #800000;
            color: #ffffff;
        }

        .header img {
            width: 5rem;
            margin-bottom: 15px;
        }

        .header h1 {
            margin: 0;
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

        p {
            text-align: justify;
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
            margin: 0;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #666666;
            padding: 15px 40px;
            background-color: rgb(239, 228, 228);
        }

        .footer-divider {
            border-top: 1px solid rgb(224, 196, 196);
            margin: 20px 0;
        }

        .important-note a {
            color: #800000;
            text-decoration: none;
            font-weight: 500;
        }

        .important-note a:hover {
            text-decoration: underline;
        }
        .button {
            text-decoration: none;
            color: #ffffff !important;
            background-color: #800000;
            padding: 14px 32px;
            border-radius: 9999px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
            text-align: center;
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
    <!-- Email Container -->
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <img src="https://images.pupt-flss.com/pup_logo_white_bg.png" alt="PUP Logo">
            <h1>PUP Taguig</h1>
            <h1>Faculty Loading and Scheduling System</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting"><b>Dear {{ $admin->last_name }}, {{ $admin->first_name }}</b></p>
            <p>The following faculty member has submitted a request to change their preferences:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #e4e4e4;"><strong>Faculty Name:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e4e4e4;">
                        {{ $faculty->last_name }}, {{ $faculty->first_name }}
                        @if ($faculty->middle_name)
                            {{ $faculty->middle_name }}
                        @endif
                        @if ($faculty->suffix_name)
                            {{ $faculty->suffix_name }}
                        @endif
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e4e4e4;"><strong>Email:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e4e4e4;">{{ $faculty->email }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #e4e4e4;"><strong>Request Type:</strong></td>
                    <td style="padding: 10px; border: 1px solid #e4e4e4;">Preference Change</td>
                </tr>
            </table>

       <!-- Button Section -->
            <div class="button-container">
                <a href="https://beta.pupt-flss.com/" class="button" style="text-decoration: none; color: white; background-color: #800000; padding: 14px 32px; border-radius: 9999px; font-size: 16px; display: inline-block; text-align: center;">Visit PUPT-FLSS Now</a>
            </div>
            <!-- Important Note -->
            <p class="important-note">Note: If you experience any technical difficulties or have questions about the
                submission process, please don't hesitate to contact our support team at <a
                    href="mailto:pupt.flss2025@gmail.com">pupt.flss2025@gmail.com</a>.</p>
        </div>
        <!-- Footer -->
        <div class="footer">
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
