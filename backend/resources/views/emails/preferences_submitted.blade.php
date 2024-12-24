<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Preferences Have Been Submitted</title>
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap">
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

        /* Content Section */
        .content {
            padding: 35px 40px;
            font-size: 16px;
            color: #2c3e50;
        }

        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 25px;
        }

        .greeting strong {
            font-weight: 700; 
        }

        p {
            text-align: justify;
            margin: 0.75em 0;
            font-size: 16px;
            font-weight: 400;
            color: #2c3e50;
        }

        .status-container {
            background-color: rgb(242, 224, 224);
            border-left: 6px solid #800000;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 6px;
        }

        .status-title {
            font-size: 16px;
            font-weight: bold;
            color: #800000;
            margin: 0 0 5px;
        }

        .status-description {
            margin: 0;
            font-size: 14px;
            color: #2c3e50;
            line-height: 1.8;
        }

        /* Button Styling */
        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            background-color: #800000;
            color: #ffffff;
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
        <!-- Header Section -->
        <div class="header">
            <img src="https://images.pupt-flss.com/pup_logo_white_bg.png" alt="PUP Logo">
            <h1>PUP Taguig</h1>
            <h1>Faculty Loading and Scheduling System</h1>
        </div>

        <!-- Content Section -->
        <div class="content">
            <p class="greeting"><strong>Dear {{ $faculty_name }},</strong></p>
            <p>Your preferences have been <strong style="color: green;">successfully</strong> submitted and are currently under review.</p>

            <!-- Pending Status Section -->
            <div class="status-container">
                <p class="status-title">Status: Pending</p>
                <p class="status-description">
                    Your submission is currently under review by our team. Once approved, you will receive a confirmation
                    email notifying you of the updated status of your preferences. Please be patient as this process may take some time.
                </p>
            </div>

            <p>Thank you for submitting your preferences. If you have any questions or need further assistance, please feel free to contact us.</p>

            <!-- Button Section -->
            <div class="button-container">
            <a href="https://beta.pupt-flss.com/" class="button" style="text-decoration: none; color: white; background-color: #800000; padding: 14px 32px; border-radius: 9999px; font-size: 16px; display: inline-block; text-align: center;">Visit PUPT-FLSS Now</a>
            </div>


            <!-- Important Note -->
            <p class="important-note">Note: If you experience any technical difficulties or have questions about the
                submission process, please don't hesitate to contact our support team at <a
                    href="mailto:pupt.flss2025@gmail.com">pupt.flss2025@gmail.com</a>.</p>
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
