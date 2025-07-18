#!/bin/bash

# CBI Banking Admin Dashboard Video Demo Creator
# This script creates a professional YouTube video with voiceover

set -e

echo "🎬 CBI Banking Admin Dashboard Video Creator"
echo "============================================="

# Create output directory
OUTPUT_DIR="video_output"
mkdir -p "$OUTPUT_DIR"

# Generate voiceover scripts
echo "📝 Creating voiceover scripts..."

# Intro script
cat > "$OUTPUT_DIR/intro_script.txt" << 'EOF'
Welcome to the CBI Banking Admin Dashboard demonstration! This comprehensive admin panel provides powerful tools for managing banking operations, user accounts, KYC processes, and transaction monitoring. Let's explore the key features that make this system exceptional for modern banking administration.
EOF

# Login script
cat > "$OUTPUT_DIR/login_script.txt" << 'EOF'
First, let's look at the secure authentication system. The admin dashboard features robust login functionality with role-based access control. Administrators can securely access the system using their credentials, ensuring that only authorized personnel can manage banking operations.
EOF

# Dashboard overview script
cat > "$OUTPUT_DIR/dashboard_script.txt" << 'EOF'
Once logged in, administrators are presented with a comprehensive dashboard overview. The interface provides real-time statistics, quick access to all major functions, and an intuitive navigation system that makes complex banking operations simple and efficient.
EOF

# User management script
cat > "$OUTPUT_DIR/user_management_script.txt" << 'EOF'
The user management section is a cornerstone of the admin panel. Here, administrators can view, edit, and manage all customer accounts. You can see detailed user profiles, account status, transaction history, and perform administrative actions like account activation, suspension, or modification.
EOF

# KYC management script
cat > "$OUTPUT_DIR/kyc_script.txt" << 'EOF'
The KYC management system streamlines customer verification processes. Administrators can review submitted documents, approve or reject applications, track verification status, and ensure compliance with banking regulations. This automated workflow significantly reduces processing time and improves accuracy.
EOF

# Transaction monitoring script
cat > "$OUTPUT_DIR/transaction_script.txt" << 'EOF'
The transaction history and monitoring tools provide comprehensive oversight of all banking activities. Administrators can filter transactions by date, amount, user, and status. Advanced search capabilities allow quick identification of patterns, investigation of specific activities, and generation of detailed reports.
EOF

# Email system script
cat > "$OUTPUT_DIR/email_script.txt" << 'EOF'
The integrated email communication system allows administrators to communicate directly with customers. Whether sending notifications, account updates, or responding to inquiries, the email interface streamlines customer communication and maintains professional correspondence records.
EOF

# Conclusion script
cat > "$OUTPUT_DIR/conclusion_script.txt" << 'EOF'
This CBI Banking Admin Dashboard provides a complete solution for modern banking administration. With its intuitive interface, comprehensive features, robust security, and scalable architecture, it empowers administrators to efficiently manage all aspects of banking operations. Thank you for watching this demonstration!
EOF

echo "✅ Voiceover scripts created successfully!"

# Generate audio files using espeak
echo "🎤 Generating voiceover audio..."

segments=("intro" "login" "dashboard" "user_management" "kyc" "transaction" "email" "conclusion")

for segment in "${segments[@]}"; do
    echo "   Generating audio for: $segment"
    espeak -s 150 -p 40 -a 100 -v en+f3 -w "$OUTPUT_DIR/${segment}_audio.wav" -f "$OUTPUT_DIR/${segment}_script.txt"
done

echo "✅ Audio generation completed!"

# Create demo images/slides for each segment
echo "🖼️  Creating demo slides..."

# Create a simple HTML slide generator
cat > "$OUTPUT_DIR/slide_generator.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CBI Banking Admin Dashboard Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .slide {
            text-align: center;
            max-width: 1200px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .logo {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .title {
            font-size: 2.5em;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .subtitle {
            font-size: 1.5em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(5px);
        }
        .feature-icon {
            font-size: 3em;
            margin-bottom: 10px;
        }
        .feature-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .feature-desc {
            font-size: 0.9em;
            opacity: 0.8;
        }
        .mockup {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .dashboard-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #007bff;
        }
        .metric {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        .metric-label {
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="slide" id="intro">
        <div class="logo">🏦 CBI Banking</div>
        <div class="title">Admin Dashboard</div>
        <div class="subtitle">Comprehensive Banking Management Solution</div>
        <div class="features">
            <div class="feature">
                <div class="feature-icon">👥</div>
                <div class="feature-title">User Management</div>
                <div class="feature-desc">Complete customer account control</div>
            </div>
            <div class="feature">
                <div class="feature-icon">🔍</div>
                <div class="feature-title">KYC Processing</div>
                <div class="feature-desc">Automated verification workflows</div>
            </div>
            <div class="feature">
                <div class="feature-icon">💳</div>
                <div class="feature-title">Transaction Monitoring</div>
                <div class="feature-desc">Real-time financial oversight</div>
            </div>
            <div class="feature">
                <div class="feature-icon">📧</div>
                <div class="feature-title">Communication Hub</div>
                <div class="feature-desc">Integrated email system</div>
            </div>
        </div>
    </div>
</body>
</html>
EOF

# Create individual slide HTML files for each segment
create_slide() {
    local segment=$1
    local title=$2
    local content=$3
    local icon=$4
    
    cat > "$OUTPUT_DIR/${segment}_slide.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title - CBI Banking Admin Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 40px;
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
        .title {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .content {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="icon">$icon</div>
        <div class="title">$title</div>
    </div>
    <div class="content">
        $content
    </div>
</body>
</html>
EOF
}

# Create slides for each segment
create_slide "login" "Secure Authentication" "
    <div class='mockup'>
        <h3>🔐 Admin Login Portal</h3>
        <p>Secure access with role-based permissions</p>
        <div style='display: flex; gap: 20px; margin-top: 20px;'>
            <div style='flex: 1; background: #e9ecef; padding: 15px; border-radius: 8px; color: #333;'>
                <label>Email Address</label><br>
                <input type='text' value='admin@cbibanking.com' style='width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;' readonly>
            </div>
            <div style='flex: 1; background: #e9ecef; padding: 15px; border-radius: 8px; color: #333;'>
                <label>Password</label><br>
                <input type='password' value='••••••••' style='width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;' readonly>
            </div>
        </div>
    </div>
" "🔐"

create_slide "dashboard" "Dashboard Overview" "
    <div class='mockup'>
        <h3>📊 Real-time Banking Statistics</h3>
        <div class='dashboard-grid'>
            <div class='dashboard-card'>
                <div class='metric'>1,247</div>
                <div class='metric-label'>Active Users</div>
            </div>
            <div class='dashboard-card'>
                <div class='metric'>\$2.3M</div>
                <div class='metric-label'>Total Deposits</div>
            </div>
            <div class='dashboard-card'>
                <div class='metric'>89</div>
                <div class='metric-label'>Pending KYC</div>
            </div>
            <div class='dashboard-card'>
                <div class='metric'>456</div>
                <div class='metric-label'>Daily Transactions</div>
            </div>
        </div>
    </div>
" "📊"

create_slide "user_management" "User Management" "
    <div class='mockup'>
        <h3>👥 Customer Account Management</h3>
        <p>Comprehensive user profile and account control system</p>
        <table style='width: 100%; margin-top: 20px; border-collapse: collapse;'>
            <tr style='background: #007bff; color: white;'>
                <th style='padding: 12px; text-align: left;'>User ID</th>
                <th style='padding: 12px; text-align: left;'>Name</th>
                <th style='padding: 12px; text-align: left;'>Email</th>
                <th style='padding: 12px; text-align: left;'>Status</th>
                <th style='padding: 12px; text-align: left;'>Actions</th>
            </tr>
            <tr style='border-bottom: 1px solid #ddd;'>
                <td style='padding: 12px;'>CBI001</td>
                <td style='padding: 12px;'>John Smith</td>
                <td style='padding: 12px;'>john.smith@email.com</td>
                <td style='padding: 12px;'><span style='background: #28a745; color: white; padding: 4px 8px; border-radius: 4px;'>Active</span></td>
                <td style='padding: 12px;'>✏️ 🔒 📧</td>
            </tr>
            <tr style='border-bottom: 1px solid #ddd;'>
                <td style='padding: 12px;'>CBI002</td>
                <td style='padding: 12px;'>Jane Doe</td>
                <td style='padding: 12px;'>jane.doe@email.com</td>
                <td style='padding: 12px;'><span style='background: #ffc107; color: black; padding: 4px 8px; border-radius: 4px;'>Pending</span></td>
                <td style='padding: 12px;'>✏️ ✅ 📧</td>
            </tr>
        </table>
    </div>
" "👥"

create_slide "kyc" "KYC Management" "
    <div class='mockup'>
        <h3>🔍 Know Your Customer Verification</h3>
        <p>Streamlined document verification and compliance management</p>
        <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;'>
            <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #28a745;'>
                <h4 style='margin-top: 0; color: #28a745;'>✅ Verified Documents</h4>
                <ul style='list-style: none; padding: 0;'>
                    <li>📄 Identity Proof</li>
                    <li>🏠 Address Proof</li>
                    <li>💼 Income Verification</li>
                </ul>
            </div>
            <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;'>
                <h4 style='margin-top: 0; color: #ffc107;'>⏳ Pending Review</h4>
                <ul style='list-style: none; padding: 0;'>
                    <li>📋 Application Form</li>
                    <li>📸 Profile Photo</li>
                    <li>✍️ Signature Sample</li>
                </ul>
            </div>
        </div>
    </div>
" "🔍"

create_slide "transaction" "Transaction Monitoring" "
    <div class='mockup'>
        <h3>💳 Financial Transaction Oversight</h3>
        <p>Advanced filtering and monitoring of all banking activities</p>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;'>
            <div style='display: flex; gap: 15px; margin-bottom: 15px;'>
                <select style='padding: 8px; border: 1px solid #ccc; border-radius: 4px;'>
                    <option>All Transaction Types</option>
                    <option>Deposits</option>
                    <option>Withdrawals</option>
                    <option>Transfers</option>
                </select>
                <input type='date' style='padding: 8px; border: 1px solid #ccc; border-radius: 4px;'>
                <input type='text' placeholder='Search amount...' style='padding: 8px; border: 1px solid #ccc; border-radius: 4px;'>
            </div>
            <div style='background: white; padding: 15px; border-radius: 8px;'>
                <div style='display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;'>
                    <span>Transfer to Jane Doe</span>
                    <span style='color: #dc3545;'>-\$1,250.00</span>
                </div>
                <div style='display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;'>
                    <span>Salary Deposit</span>
                    <span style='color: #28a745;'>+\$3,500.00</span>
                </div>
                <div style='display: flex; justify-content: space-between; padding: 10px 0;'>
                    <span>ATM Withdrawal</span>
                    <span style='color: #dc3545;'>-\$200.00</span>
                </div>
            </div>
        </div>
    </div>
" "💳"

create_slide "email" "Email Communication" "
    <div class='mockup'>
        <h3>📧 Customer Communication Hub</h3>
        <p>Professional email management and customer correspondence</p>
        <div style='background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;'>
            <div style='background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;'>
                <div style='display: flex; justify-content: space-between; margin-bottom: 10px;'>
                    <strong>To:</strong> john.smith@email.com
                </div>
                <div style='display: flex; justify-content: space-between; margin-bottom: 10px;'>
                    <strong>Subject:</strong> Account Verification Complete
                </div>
                <div style='margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 4px;'>
                    <p>Dear Mr. Smith,</p>
                    <p>We are pleased to inform you that your account verification has been completed successfully. You now have full access to all banking services.</p>
                    <p>Best regards,<br>CBI Banking Team</p>
                </div>
            </div>
        </div>
    </div>
" "📧"

create_slide "conclusion" "Thank You" "
    <div style='text-align: center;'>
        <h2>🎉 CBI Banking Admin Dashboard</h2>
        <p style='font-size: 1.3em; margin: 30px 0;'>Complete Banking Management Solution</p>
        <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 40px 0;'>
            <div style='background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 15px;'>
                <div style='font-size: 2em; margin-bottom: 10px;'>🚀</div>
                <div>Ready for Production</div>
            </div>
            <div style='background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 15px;'>
                <div style='font-size: 2em; margin-bottom: 10px;'>🔒</div>
                <div>Enterprise Security</div>
            </div>
            <div style='background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 15px;'>
                <div style='font-size: 2em; margin-bottom: 10px;'>⚡</div>
                <div>High Performance</div>
            </div>
            <div style='background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 15px;'>
                <div style='font-size: 2em; margin-bottom: 10px;'>📱</div>
                <div>Responsive Design</div>
            </div>
        </div>
        <p style='font-size: 1.5em; margin-top: 40px;'>Thank you for watching!</p>
    </div>
" "🎉"

echo "✅ Demo slides created successfully!"

# Function to capture slide as image using chromium
capture_slide() {
    local slide_name=$1
    echo "   Capturing slide: $slide_name"
    
    # Start virtual display
    Xvfb :99 -screen 0 1920x1080x24 &
    XVFB_PID=$!
    export DISPLAY=:99
    sleep 2
    
    # Capture screenshot using chromium
    chromium-browser --headless --disable-gpu --virtual-time-budget=5000 --window-size=1920,1080 --screenshot="$OUTPUT_DIR/${slide_name}.png" "file://$(pwd)/$OUTPUT_DIR/${slide_name}_slide.html" 2>/dev/null
    
    # Kill virtual display
    kill $XVFB_PID 2>/dev/null || true
}

# Capture all slides
echo "📸 Capturing slide screenshots..."
for segment in "${segments[@]}"; do
    capture_slide "$segment"
done

echo "✅ Screenshots captured successfully!"

# Create video segments from images and audio
echo "🎬 Creating video segments..."

for segment in "${segments[@]}"; do
    echo "   Creating video segment: $segment"
    
    # Get audio duration
    duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_DIR/${segment}_audio.wav" 2>/dev/null || echo "10")
    
    # Create video from image and audio
    ffmpeg -y -loop 1 -i "$OUTPUT_DIR/${segment}.png" -i "$OUTPUT_DIR/${segment}_audio.wav" \
           -c:v libx264 -t "$duration" -pix_fmt yuv420p -vf "scale=1920:1080" \
           -c:a aac -strict experimental -shortest \
           "$OUTPUT_DIR/${segment}_video.mp4" 2>/dev/null
done

echo "✅ Video segments created successfully!"

# Create file list for concatenation
echo "🔗 Creating final video..."
echo "# Video segment list" > "$OUTPUT_DIR/concat_list.txt"
for segment in "${segments[@]}"; do
    echo "file '${segment}_video.mp4'" >> "$OUTPUT_DIR/concat_list.txt"
done

# Concatenate all video segments
ffmpeg -y -f concat -safe 0 -i "$OUTPUT_DIR/concat_list.txt" -c copy "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Demo.mp4" 2>/dev/null

# Add fade transitions and professional touch
ffmpeg -y -i "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Demo.mp4" \
       -vf "fade=in:0:30,fade=out:st=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Demo.mp4" | awk '{print int($1-1)}'):d=1" \
       -c:a copy "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Final.mp4" 2>/dev/null

echo ""
echo "🎉 VIDEO CREATION COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "📹 Your YouTube-ready video is available at:"
echo "   $(pwd)/$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Final.mp4"
echo ""
echo "📊 Video Details:"
echo "   • Resolution: 1920x1080 (Full HD)"
echo "   • Format: MP4 (YouTube optimized)"
echo "   • Audio: Professional voiceover"
echo "   • Duration: ~3-4 minutes"
echo "   • Segments: ${#segments[@]} sections"
echo ""
echo "📝 Video Segments Included:"
for segment in "${segments[@]}"; do
    echo "   ✓ $(echo $segment | tr '_' ' ' | sed 's/\b\w/\U&/g')"
done
echo ""
echo "🚀 Ready to upload to YouTube!"
echo "💡 Tip: Add tags like 'admin dashboard', 'banking software', 'fintech', 'web development'"
echo ""

# Show file size
if [ -f "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Final.mp4" ]; then
    SIZE=$(du -h "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Final.mp4" | cut -f1)
    echo "📦 Final video size: $SIZE"
fi

echo ""
echo "✨ All done! Your professional demo video is ready for YouTube upload!"