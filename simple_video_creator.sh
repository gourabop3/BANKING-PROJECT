#!/bin/bash

# CBI Banking Admin Dashboard Simple Video Creator
set -e

echo "🎬 CBI Banking Admin Dashboard Video Creator"
echo "============================================="

# Create output directory
OUTPUT_DIR="video_output"
mkdir -p "$OUTPUT_DIR"

echo "📝 Creating voiceover scripts and audio..."

# Create scripts and audio files
scripts=(
    "intro|Welcome to the CBI Banking Admin Dashboard demonstration! This comprehensive admin panel provides powerful tools for managing banking operations, user accounts, KYC processes, and transaction monitoring. Let's explore the key features that make this system exceptional for modern banking administration."
    "login|First, let's look at the secure authentication system. The admin dashboard features robust login functionality with role-based access control. Administrators can securely access the system using their credentials, ensuring that only authorized personnel can manage banking operations."
    "dashboard|Once logged in, administrators are presented with a comprehensive dashboard overview. The interface provides real-time statistics, quick access to all major functions, and an intuitive navigation system that makes complex banking operations simple and efficient."
    "users|The user management section is a cornerstone of the admin panel. Here, administrators can view, edit, and manage all customer accounts. You can see detailed user profiles, account status, transaction history, and perform administrative actions like account activation, suspension, or modification."
    "kyc|The KYC management system streamlines customer verification processes. Administrators can review submitted documents, approve or reject applications, track verification status, and ensure compliance with banking regulations. This automated workflow significantly reduces processing time and improves accuracy."
    "transactions|The transaction history and monitoring tools provide comprehensive oversight of all banking activities. Administrators can filter transactions by date, amount, user, and status. Advanced search capabilities allow quick identification of patterns, investigation of specific activities, and generation of detailed reports."
    "email|The integrated email communication system allows administrators to communicate directly with customers. Whether sending notifications, account updates, or responding to inquiries, the email interface streamlines customer communication and maintains professional correspondence records."
    "conclusion|This CBI Banking Admin Dashboard provides a complete solution for modern banking administration. With its intuitive interface, comprehensive features, robust security, and scalable architecture, it empowers administrators to efficiently manage all aspects of banking operations. Thank you for watching this demonstration!"
)

# Generate audio files
for script_data in "${scripts[@]}"; do
    IFS='|' read -r segment text <<< "$script_data"
    echo "   Generating audio for: $segment"
    echo "$text" > "$OUTPUT_DIR/${segment}_script.txt"
    espeak -s 150 -p 40 -a 100 -v en+f3 -w "$OUTPUT_DIR/${segment}_audio.wav" "$text"
done

echo "✅ Audio generation completed!"

# Create simple colored background images
echo "🎨 Creating background images..."

create_background_image() {
    local name=$1
    local title=$2
    local subtitle=$3
    local color=$4
    
    # Create SVG image
    cat > "$OUTPUT_DIR/${name}.svg" << EOF
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#grad1)" />
  <text x="960" y="400" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">$title</text>
  <text x="960" y="500" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="white" opacity="0.9">$subtitle</text>
  <circle cx="960" cy="250" r="80" fill="rgba(255,255,255,0.2)" />
  <text x="960" y="270" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="white">🏦</text>
</svg>
EOF

    # Convert SVG to PNG using built-in tools if available, otherwise create a simple colored image
    if command -v convert &> /dev/null; then
        convert "$OUTPUT_DIR/${name}.svg" "$OUTPUT_DIR/${name}.png"
    else
        # Create a simple colored PNG using ffmpeg
        ffmpeg -f lavfi -i "color=${color}:size=1920x1080:duration=1" -vframes 1 "$OUTPUT_DIR/${name}_bg.png" 2>/dev/null
        # Add text overlay
        ffmpeg -i "$OUTPUT_DIR/${name}_bg.png" -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='$title':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2-50,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='$subtitle':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2+50" "$OUTPUT_DIR/${name}.png" 2>/dev/null
        rm -f "$OUTPUT_DIR/${name}_bg.png"
    fi
    rm -f "$OUTPUT_DIR/${name}.svg"
}

# Create background images for each segment
create_background_image "intro" "CBI Banking Admin Dashboard" "Comprehensive Banking Management Solution" "#3498db"
create_background_image "login" "Secure Authentication" "Role-based Access Control" "#e74c3c"
create_background_image "dashboard" "Dashboard Overview" "Real-time Banking Statistics" "#2ecc71"
create_background_image "users" "User Management" "Customer Account Control" "#f39c12"
create_background_image "kyc" "KYC Management" "Document Verification System" "#9b59b6"
create_background_image "transactions" "Transaction Monitoring" "Financial Activity Oversight" "#1abc9c"
create_background_image "email" "Email Communication" "Customer Correspondence Hub" "#34495e"
create_background_image "conclusion" "Thank You!" "Ready for Production" "#27ae60"

echo "✅ Background images created!"

# Create video segments
echo "🎬 Creating video segments..."

segments=("intro" "login" "dashboard" "users" "kyc" "transactions" "email" "conclusion")

for segment in "${segments[@]}"; do
    echo "   Creating video for: $segment"
    
    # Get audio duration
    duration=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_DIR/${segment}_audio.wav" 2>/dev/null || echo "10")
    
    # Create video from image and audio
    ffmpeg -y -loop 1 -i "$OUTPUT_DIR/${segment}.png" -i "$OUTPUT_DIR/${segment}_audio.wav" \
           -c:v libx264 -t "$duration" -pix_fmt yuv420p -vf "scale=1920:1080" \
           -c:a aac -strict experimental -shortest \
           "$OUTPUT_DIR/${segment}_video.mp4" 2>/dev/null
done

echo "✅ Video segments created!"

# Create concatenation list
echo "🔗 Combining video segments..."
echo "# Video segment list" > "$OUTPUT_DIR/concat_list.txt"
for segment in "${segments[@]}"; do
    echo "file '${segment}_video.mp4'" >> "$OUTPUT_DIR/concat_list.txt"
done

# Concatenate all segments
ffmpeg -y -f concat -safe 0 -i "$OUTPUT_DIR/concat_list.txt" -c copy "$OUTPUT_DIR/CBI_Banking_Demo_Raw.mp4" 2>/dev/null

# Add fade effects for professional look
echo "✨ Adding professional finishing touches..."
ffmpeg -y -i "$OUTPUT_DIR/CBI_Banking_Demo_Raw.mp4" \
       -vf "fade=in:0:30,fade=out:st=$(ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_DIR/CBI_Banking_Demo_Raw.mp4" | awk '{print int($1-1)}'):d=30" \
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
echo "💡 Recommended YouTube title: 'CBI Banking Admin Dashboard - Complete Banking Management Solution'"
echo "💡 Recommended tags: admin dashboard, banking software, fintech, web development, user management, KYC, transactions"
echo ""

# Show file size
if [ -f "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Final.mp4" ]; then
    SIZE=$(du -h "$OUTPUT_DIR/CBI_Banking_Admin_Dashboard_Final.mp4" | cut -f1)
    echo "📦 Final video size: $SIZE"
fi

echo ""
echo "✨ All done! Your professional demo video is ready for YouTube upload!"
echo ""
echo "🎬 Next steps:"
echo "   1. Upload the video to YouTube"
echo "   2. Add an engaging thumbnail"
echo "   3. Include relevant tags and description"
echo "   4. Share with your audience!"