import { FaReact, FaNodeJs, FaGithub, FaLinkedin, FaInstagram, FaTelegram } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiMongodb, SiExpress, SiJsonwebtokens, SiCloudinary, SiRazorpay, SiOpenai } from 'react-icons/si';
import { MdPayment, MdAccountBalance, MdSecurity, MdPhoneAndroid, MdReceipt, MdCreditCard, MdSupport, MdSwapHoriz } from 'react-icons/md';
import { AiOutlineMail } from 'react-icons/ai';
//import HeaderName from '@/components/HeaderName';

const frontendDependencies = [
  { name: 'Next.js', desc: 'React framework for server-side rendering and routing in the frontend.' },
  { name: 'React', desc: 'Component-based UI library for building interactive user interfaces.' },
  { name: 'TailwindCSS', desc: 'Utility-first CSS framework for styling and responsive layouts.' },
  { name: 'Framer Motion', desc: 'Animation library for smooth transitions and UI effects.' },
  { name: 'Axios', desc: 'HTTP client for making API requests to the backend.' },
  { name: 'Redux Toolkit', desc: 'State management for handling global app state.' },
  { name: 'Formik', desc: 'Form handling library for managing form state and validation.' },
  { name: 'Yup', desc: 'Schema validation for form inputs.' },
  { name: 'React Toastify', desc: 'Notification system for user feedback and alerts.' },
  { name: 'React Icons', desc: 'Icon library for adding vector icons to the UI.' },
  { name: 'Headless UI', desc: 'Accessible UI components for modals, dropdowns, etc.' },
  { name: 'Lucide React', desc: 'Icon set for modern UI icons.' },
  { name: 'Moment', desc: 'Date and time formatting and manipulation.' },
  { name: 'React Dropzone', desc: 'File upload component for drag-and-drop uploads.' },
  { name: 'Pro Sidebar', desc: 'Sidebar navigation component for dashboard layouts.' },
  { name: 'UUID', desc: 'Unique ID generation for keys and identifiers.' }
];

const backendDependencies = [
  { name: 'Node.js', desc: 'JavaScript runtime for running the backend server.' },
  { name: 'Express.js', desc: 'Web framework for building RESTful APIs.' },
  { name: 'MongoDB', desc: 'NoSQL database for storing user, account, and transaction data.' },
  { name: 'Mongoose', desc: 'ODM for MongoDB, providing schema and model support.' },
  { name: 'JWT', desc: 'Token-based authentication for secure API access.' },
  { name: 'BcryptJS', desc: 'Password hashing for secure user authentication.' },
  { name: 'Cloudinary', desc: 'Cloud storage for user profile images and KYC documents.' },
  { name: 'Razorpay', desc: 'Payment gateway integration for processing payments and recharges.' },
  { name: 'OpenAI', desc: 'AI chatbot integration for customer support and queries.' },
  { name: 'Nodemailer', desc: 'Email service for sending notifications and OTPs.' },
  { name: 'Express Validator', desc: 'Middleware for validating and sanitizing API inputs.' },
  { name: 'Random Int', desc: 'Random number generation for transaction IDs and card numbers.' },
  { name: 'Dotenv', desc: 'Environment variable management for configuration.' },
  { name: 'CORS', desc: 'Cross-Origin Resource Sharing middleware for API security.' },
  { name: 'Morgan', desc: 'HTTP request logger for backend debugging.' },
  { name: 'Multer', desc: 'Middleware for handling file uploads.' },
  { name: 'QRCode', desc: 'QR code generation for UPI and payment features.' },
  { name: 'Faker', desc: 'Fake data generation for testing and development.' }
];

const projectFeatures = [
  { title: 'UPI Payment System', desc: 'Instant money transfers using UPI ID with real-time balance updates and transaction history' },
  { title: 'Mobile Recharge', desc: 'Quick mobile and DTH recharge services integrated with telecom operators' },
  { title: 'Account Management', desc: 'Multiple account types (Saving, Current) with balance tracking and account statements' },
  { title: 'Bill Payments', desc: 'Utility bill payments for electricity, water, gas with automated receipt generation' },
  { title: 'ATM Card Management', desc: 'Virtual ATM card generation with CVV, expiry date, and PIN management' },
  { title: 'AI Customer Service', desc: 'OpenAI-powered chatbot for 24/7 banking assistance and query resolution' },
  { title: 'Money Transfer', desc: 'Secure peer-to-peer transfers with OTP verification and transaction limits' },
  { title: 'Security Features', desc: 'JWT authentication, password encryption, KYC verification, and fraud detection' },
  { title: 'Fixed Deposits', desc: 'FD creation and management with interest calculation and maturity tracking' },
  { title: 'Transaction History', desc: 'Detailed transaction logs with filtering, search, and export functionality' },
  { title: 'Profile Management', desc: 'User profile with KYC verification, document upload, and account settings' },
  { title: 'API Integration', desc: 'RESTful APIs for third-party integration with secure authentication tokens' }
];

const socialLinks = [
  { href: 'https://github.com/gourabop', label: 'GitHub', icon: FaGithub },
  { href: 'https://linkedin.com/in/gourabmullick', label: 'LinkedIn', icon: FaLinkedin },
  { href: 'https://instagram.com/gourab_op_84', label: 'Instagram', icon: FaInstagram },
  { href: 'https://t.me/its_me_gourab', label: 'Telegram', icon: FaTelegram },
  { href: 'mailto:gourabmullick200@gmail.com', label: 'Email', icon: AiOutlineMail }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <HeaderName />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About CBI Payment Gateway
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A comprehensive digital banking platform built with modern technologies to provide secure, fast, and reliable financial services for the digital age.
          </p>
        </div>

        {/* Technology Stack */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Frontend Dependencies */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaReact className="text-2xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Frontend Dependencies</h2>
                <p className="text-gray-600">Key libraries and tools used in the frontend</p>
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              {frontendDependencies.map(dep => (
                <li key={dep.name}>
                  <span className="font-semibold text-gray-900">{dep.name}:</span> <span className="text-gray-700">{dep.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Backend Dependencies */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaNodeJs className="text-2xl text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Backend Dependencies</h2>
                <p className="text-gray-600">Key libraries and tools used in the backend</p>
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              {backendDependencies.map(dep => (
                <li key={dep.name}>
                  <span className="font-semibold text-gray-900">{dep.name}:</span> <span className="text-gray-700">{dep.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Project Features */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Features</h2>
            <p className="text-gray-600">Comprehensive banking solutions for modern financial needs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-3">
              {projectFeatures.slice(0, 6).map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-purple-600 text-lg mt-1">•</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              {projectFeatures.slice(6).map(({ title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-purple-600 text-lg mt-1">•</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Developer Social Links */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-sm"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
          
          <div className="relative z-10 text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Let's Connect!
            </h2>
            <p className="text-purple-100 text-lg font-medium">
              Follow me on social media and get in touch
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap justify-center gap-6">
            {socialLinks.map(({ href, label, icon: Icon }) => {
              const colorClasses = {
                'GitHub': 'from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 shadow-gray-500/30',
                'LinkedIn': 'from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-blue-500/30',
                'Instagram': 'from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 shadow-pink-500/30',
                'Telegram': 'from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/30',
                'Email': 'from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 shadow-red-500/30'
              };
              
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative bg-gradient-to-r ${colorClasses[label]} 
                    px-8 py-4 rounded-2xl text-white font-semibold text-lg
                    transform transition-all duration-300 hover:scale-110 hover:rotate-2
                    shadow-lg hover:shadow-2xl backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-2xl group-hover:animate-bounce" />
                    <span className="font-bold tracking-wide">{label}</span>
                  </div>
                  
                  {/* Glowing effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  
                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                </a>
              );
            })}
          </div>
          
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-ping" style={{top: '20%', left: '15%', animationDelay: '0s'}}></div>
            <div className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping" style={{top: '60%', left: '80%', animationDelay: '2s'}}></div>
            <div className="absolute w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{top: '80%', left: '20%', animationDelay: '1s'}}></div>
            <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{top: '30%', right: '25%', animationDelay: '3s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}