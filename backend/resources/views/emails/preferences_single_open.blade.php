<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculty Preferences Submission</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            font-family: Arial, sans-serif;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
        }

        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #800000;
            color: #ffffff;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 20px;
            color: #555555;
            font-size: 16px;
            line-height: 1.6;
        }

        .content strong {
            color: #333333;
        }

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            background-color: #800000; 
            color: #ffffff !important; 
            text-decoration: none;
            padding: 15px 25px;
            border-radius: 5px;
            font-size: 15px;
            font-weight: normal;
            display: inline-block;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            padding: 20px;
            border-top: 1px solid #dddddd;
        }

        .footer a {
            color: #2F67F6;
            text-decoration: none;
        }

        .social-icons {
            margin: 10px 0;
        }

        .social-icons img {
            width: 24px;
            margin: 0 5px;
            vertical-align: middle;
        }
    </style>
</head>
<body>

    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <h1>Faculty Preferences Submission</h1>
        </div>

        <!-- Content Section -->
        <div class="content">
            <p>Dear {{ $faculty_name }},</p>
            <p>We would like to inform you that the submission for your load and schedule preferences is now open.</p>
            <p>Please submit your preferences by the deadline: <strong>{{ $individual_deadline }}</strong> ({{ $days_left }} {{ $days_left == 1 ? 'day' : 'days' }} left).</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>

        <!-- Button Section -->
        <div class="button-container">
            <a href="http://localhost:4200/faculty/login" class="button">Set Preferences</a>
        </div>

        <!-- Footer Section -->
        <div class="footer">
            <p>Need assistance? If you have any questions, you can reach us at <a href="mailto:puptflss@gmail.com">puptflss@gmail.com</a>.</p>
            <p>&copy; 2024 PUP-T FLS SYSTEM. All rights reserved.</p>
        </div>
    </div>

</body>
</html>
