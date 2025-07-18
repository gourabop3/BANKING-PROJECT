#!/usr/bin/env python3
"""
CBI Banking Admin Dashboard Video Demo Script
This script creates a professional video demonstration with voiceover for YouTube
"""

import os
import subprocess
import time
import threading
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class VideoDemoRecorder:
    def __init__(self):
        self.output_dir = "video_output"
        self.audio_files = []
        self.video_segments = []
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Chrome options for headless recording
        self.chrome_options = Options()
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--window-size=1920,1080')
        self.chrome_options.add_argument('--disable-web-security')
        self.chrome_options.add_argument('--allow-running-insecure-content')
        
    def generate_voiceover(self, text, filename):
        """Generate voiceover audio using espeak"""
        audio_path = os.path.join(self.output_dir, f"{filename}.wav")
        cmd = [
            "espeak", 
            "-s", "150",  # Speed
            "-p", "40",   # Pitch
            "-a", "100",  # Amplitude
            "-v", "en+f3", # Voice (female variant)
            "-w", audio_path,
            text
        ]
        subprocess.run(cmd, check=True)
        self.audio_files.append(audio_path)
        return audio_path
    
    def start_screen_recording(self, output_filename, duration=30):
        """Start screen recording using ffmpeg"""
        video_path = os.path.join(self.output_dir, f"{output_filename}.mp4")
        
        # Use virtual display for headless recording
        cmd = [
            "ffmpeg", "-y",
            "-f", "x11grab",
            "-video_size", "1920x1080",
            "-framerate", "30",
            "-i", ":99",  # Virtual display
            "-t", str(duration),
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", "23",
            video_path
        ]
        
        process = subprocess.Popen(cmd)
        self.video_segments.append(video_path)
        return process, video_path
    
    def setup_virtual_display(self):
        """Setup virtual display for headless recording"""
        cmd = ["Xvfb", ":99", "-screen", "0", "1920x1080x24"]
        process = subprocess.Popen(cmd)
        time.sleep(2)  # Wait for display to start
        os.environ["DISPLAY"] = ":99"
        return process
    
    def create_demo_segments(self):
        """Create individual demo segments with voiceover"""
        
        # Segment 1: Introduction
        intro_text = """
        Welcome to the CBI Banking Admin Dashboard demonstration! 
        This comprehensive admin panel provides powerful tools for managing 
        banking operations, user accounts, KYC processes, and transaction monitoring.
        Let's explore the key features that make this system exceptional.
        """
        
        # Segment 2: Login and Dashboard Overview
        login_text = """
        First, let's log into the admin dashboard. The system features secure 
        authentication with role-based access control. Once logged in, 
        administrators get a comprehensive overview of the banking system 
        with real-time statistics and quick access to all major functions.
        """
        
        # Segment 3: User Management
        user_mgmt_text = """
        The user management section allows administrators to view, edit, 
        and manage all customer accounts. You can see detailed user profiles, 
        account status, and perform administrative actions like account 
        activation or suspension.
        """
        
        # Segment 4: KYC Management
        kyc_text = """
        The KYC management system streamlines customer verification processes. 
        Administrators can review submitted documents, approve or reject 
        applications, and track the verification status of all customers. 
        This ensures compliance with banking regulations.
        """
        
        # Segment 5: Transaction Monitoring
        transaction_text = """
        The transaction history and monitoring tools provide comprehensive 
        oversight of all banking activities. Administrators can filter 
        transactions by date, amount, user, and status to identify patterns 
        or investigate specific activities.
        """
        
        # Segment 6: Email Communication
        email_text = """
        The integrated email system allows administrators to communicate 
        directly with customers. Whether sending notifications, updates, 
        or responding to inquiries, the email interface streamlines 
        customer communication.
        """
        
        # Segment 7: Conclusion
        conclusion_text = """
        This CBI Banking Admin Dashboard provides a complete solution for 
        modern banking administration. With its intuitive interface, 
        comprehensive features, and robust security, it empowers 
        administrators to efficiently manage all aspects of banking operations. 
        Thank you for watching this demonstration!
        """
        
        segments = [
            ("intro", intro_text, 15),
            ("login", login_text, 20),
            ("user_management", user_mgmt_text, 25),
            ("kyc_management", kyc_text, 25),
            ("transactions", transaction_text, 25),
            ("email_system", email_text, 20),
            ("conclusion", conclusion_text, 15)
        ]
        
        return segments
    
    def automate_browser_demo(self, driver, segment_name):
        """Automate browser interactions for different demo segments"""
        try:
            if segment_name == "intro":
                # Show landing page or documentation
                driver.get("http://localhost:3000")
                time.sleep(3)
                
            elif segment_name == "login":
                # Navigate to login page
                driver.get("http://localhost:3000/login")
                time.sleep(2)
                
                # Fill login form (use demo credentials)
                try:
                    email_field = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.NAME, "email"))
                    )
                    password_field = driver.find_element(By.NAME, "password")
                    
                    email_field.send_keys("admin@cbibanking.com")
                    time.sleep(1)
                    password_field.send_keys("admin123")
                    time.sleep(1)
                    
                    # Submit form
                    submit_btn = driver.find_element(By.TYPE, "submit")
                    submit_btn.click()
                    time.sleep(3)
                except:
                    print("Login form elements not found, continuing with current page")
                
            elif segment_name == "user_management":
                # Navigate to user management
                driver.get("http://localhost:3000/users")
                time.sleep(3)
                
                # Scroll to show user list
                driver.execute_script("window.scrollTo(0, 500);")
                time.sleep(2)
                driver.execute_script("window.scrollTo(0, 0);")
                
            elif segment_name == "kyc_management":
                # Navigate to KYC section
                driver.get("http://localhost:3000/kyc")
                time.sleep(3)
                
                # Show KYC applications
                driver.execute_script("window.scrollTo(0, 300);")
                time.sleep(2)
                
            elif segment_name == "transactions":
                # Navigate to transactions
                driver.get("http://localhost:3000/transactions")
                time.sleep(3)
                
                # Scroll through transaction history
                driver.execute_script("window.scrollTo(0, 400);")
                time.sleep(2)
                driver.execute_script("window.scrollTo(0, 0);")
                
            elif segment_name == "email_system":
                # Navigate to email system
                driver.get("http://localhost:3000/email")
                time.sleep(3)
                
                # Show email interface
                driver.execute_script("window.scrollTo(0, 200);")
                time.sleep(2)
                
            elif segment_name == "conclusion":
                # Return to dashboard overview
                driver.get("http://localhost:3000/dashboard")
                time.sleep(3)
                
                # Show final overview
                driver.execute_script("window.scrollTo(0, 300);")
                time.sleep(2)
                driver.execute_script("window.scrollTo(0, 0);")
                
        except Exception as e:
            print(f"Browser automation error for {segment_name}: {e}")
            # Continue with static display
            time.sleep(5)
    
    def record_segment(self, segment_name, voiceover_text, duration):
        """Record a single demo segment"""
        print(f"Recording segment: {segment_name}")
        
        # Generate voiceover
        audio_path = self.generate_voiceover(voiceover_text, segment_name)
        
        # Start screen recording
        recording_process, video_path = self.start_screen_recording(segment_name, duration)
        
        # Setup browser for automation
        driver = webdriver.Chrome(options=self.chrome_options)
        
        try:
            # Automate browser interactions
            self.automate_browser_demo(driver, segment_name)
            
            # Wait for recording to complete
            recording_process.wait()
            
        finally:
            driver.quit()
        
        return video_path, audio_path
    
    def combine_video_audio(self, video_path, audio_path, output_path):
        """Combine video and audio using ffmpeg"""
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-i", audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-strict", "experimental",
            "-shortest",
            output_path
        ]
        subprocess.run(cmd, check=True)
    
    def create_final_video(self):
        """Combine all segments into final video"""
        # Create file list for concatenation
        concat_file = os.path.join(self.output_dir, "concat_list.txt")
        
        with open(concat_file, 'w') as f:
            for i, video_file in enumerate(self.video_segments):
                segment_with_audio = video_file.replace('.mp4', '_with_audio.mp4')
                f.write(f"file '{segment_with_audio}'\n")
        
        # Concatenate all segments
        final_video = os.path.join(self.output_dir, "CBI_Banking_Admin_Dashboard_Demo.mp4")
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_file,
            "-c", "copy",
            final_video
        ]
        subprocess.run(cmd, check=True)
        
        print(f"Final video created: {final_video}")
        return final_video
    
    def create_youtube_demo(self):
        """Create complete YouTube demo video"""
        print("Starting CBI Banking Admin Dashboard video creation...")
        
        # Setup virtual display for headless recording
        display_process = self.setup_virtual_display()
        
        try:
            # Get demo segments
            segments = self.create_demo_segments()
            
            # Record each segment
            for segment_name, voiceover_text, duration in segments:
                video_path, audio_path = self.record_segment(segment_name, voiceover_text, duration)
                
                # Combine video and audio for this segment
                output_with_audio = video_path.replace('.mp4', '_with_audio.mp4')
                self.combine_video_audio(video_path, audio_path, output_with_audio)
                
                print(f"Completed segment: {segment_name}")
            
            # Create final combined video
            final_video = self.create_final_video()
            
            print(f"\n🎥 Video demo completed successfully!")
            print(f"📁 Output location: {final_video}")
            print(f"📊 Total segments: {len(segments)}")
            print(f"🎬 Ready for YouTube upload!")
            
            return final_video
            
        finally:
            # Cleanup virtual display
            display_process.terminate()

def main():
    """Main function to create the video demo"""
    recorder = VideoDemoRecorder()
    
    print("🎬 CBI Banking Admin Dashboard Video Creator")
    print("=" * 50)
    print("This script will create a professional video demonstration")
    print("of your admin dashboard with automated voiceover.")
    print("=" * 50)
    
    try:
        final_video = recorder.create_youtube_demo()
        
        print("\n✅ Video creation completed successfully!")
        print(f"\n📹 Your YouTube-ready video is available at:")
        print(f"   {final_video}")
        print(f"\n📝 Video details:")
        print(f"   • Resolution: 1920x1080 (Full HD)")
        print(f"   • Format: MP4 (YouTube optimized)")
        print(f"   • Audio: Professional voiceover")
        print(f"   • Duration: ~2-3 minutes")
        print(f"\n🚀 Ready to upload to YouTube!")
        
    except Exception as e:
        print(f"\n❌ Error creating video: {e}")
        print("Please check the error details above and try again.")

if __name__ == "__main__":
    main()