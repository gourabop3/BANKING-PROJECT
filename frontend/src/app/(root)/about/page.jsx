import { FaReact, FaNodeJs, FaGithub, FaLinkedin, FaInstagram, FaTelegram } from 'react-icons/fa';
import { SiNextdotjs, SiTailwindcss, SiMongodb, SiExpress, SiJsonwebtokens, SiCloudinary, SiRazorpay, SiOpenai } from 'react-icons/si';
import { MdPayment, MdAccountBalance, MdSecurity, MdPhoneAndroid, MdReceipt, MdCreditCard, MdSupport, MdSwapHoriz } from 'react-icons/md';
import { AiOutlineMail } from 'react-icons/ai';
import HeaderName from '@/components/HeaderName';

const frontendTech = [
  { name: 'Next.js', version: '15.2.4', desc: 'React framework for banking app with SSR for fast page loads and SEO optimization' },
  { name: 'React', version: '19.0.0', desc: 'Component-based UI library for building interactive banking dashboard and forms' },
  { name: 'TailwindCSS', version: '4.0', desc: 'Utility-first CSS framework for consistent banking UI design and responsive layouts' },
  { name: 'Framer Motion', version: '12.23.3', desc: 'Animation library for smooth card transitions and professional UX in banking interface' },
  { name: 'Axios', version: '1.8.4', desc: 'HTTP client for secure API calls to backend for transactions and user data' },
  { name: 'Redux Toolkit', version: '2.6.1', desc: 'State management for user authentication, account balance, and transaction history' },
  { name: 'Formik', version: '2.4.6', desc: 'Form handling library for secure login, registration, and payment forms' },
  { name: 'Yup', version: '1.6.1', desc: 'Schema validation for banking forms to ensure data integrity and security' },
  { name: 'React Toastify', version: '11.0.5', desc: 'Notification system for transaction alerts and user feedback in banking app' },
  { name: 'React Icons', version: '5.5.0', desc: 'Icon library for banking symbols, payment methods, and UI elements' }
];

const backendTech = [
  { name: 'Node.js', version: 'Latest', desc: 'JavaScript runtime for building scalable banking server to handle concurrent transactions' },
  { name: 'Express.js', version: '5.1.0', desc: 'Web framework for creating RESTful APIs for banking operations like transfers, payments' },
  { name: 'MongoDB', version: '8.13.2', desc: 'NoSQL database to store user accounts, transaction history, and banking records' },
  { name: 'JWT', version: '9.0.2', desc: 'Token-based authentication for secure banking sessions and API access' },
  { name: 'Cloudinary', version: '2.6.1', desc: 'Cloud storage for user profile images, KYC documents, and banking certificates' },
  { name: 'Razorpay', version: '2.9.6', desc: 'Payment gateway integration for processing real money transactions and UPI payments' },
  { name: 'OpenAI', version: '4.21.0', desc: 'AI chatbot for 24/7 customer support and banking query assistance' },
  { name: 'bcryptjs', version: '3.0.2', desc: 'Password encryption library for secure user authentication and data protection' },
  { name: 'Mongoose', version: '8.13.2', desc: 'MongoDB ODM for structured banking data modeling and validation' },
  { name: 'Nodemailer', version: '7.0.3', desc: 'Email service for sending transaction receipts, OTP verification, and notifications' },
  { name: 'Express Validator', version: '7.2.1', desc: 'Input validation middleware for banking forms and API security' },
  { name: 'Random Int', version: '3.0.0', desc: 'Secure random number generation for ATM card numbers and transaction IDs' }
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
          {/* Frontend Technologies */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaReact className="text-2xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Frontend Technologies</h2>
                <p className="text-gray-600">Modern UI/UX Development</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {frontendTech.map(({ name, version, desc }) => (
                <div key={name} className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg mt-1">•</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">v{version}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Technologies */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaNodeJs className="text-2xl text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Backend Technologies</h2>
                <p className="text-gray-600">Server-side Development</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {backendTech.map(({ name, version, desc }) => (
                <div key={name} className="flex items-start gap-3">
                  <span className="text-green-600 text-lg mt-1">•</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{version}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Architecture & Design Decisions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why These Technologies?</h2>
            <p className="text-gray-600">Strategic technology choices for a secure and scalable banking platform</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">Security First Approach</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-lg mt-1">•</span>
                  <span><strong>JWT</strong> for stateless authentication and secure API access</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-lg mt-1">•</span>
                  <span><strong>bcryptjs</strong> for one-way password hashing protection</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-lg mt-1">•</span>
                  <span><strong>Express Validator</strong> for input sanitization and validation</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-lg mt-1">•</span>
                  <span><strong>HTTPS</strong> enforcement for all banking transactions</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">Scalability & Performance</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-lg mt-1">•</span>
                  <span><strong>MongoDB</strong> for horizontal scaling and flexible data models</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-lg mt-1">•</span>
                  <span><strong>Node.js</strong> for non-blocking I/O and concurrent connections</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-lg mt-1">•</span>
                  <span><strong>Next.js</strong> for server-side rendering and optimal performance</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-lg mt-1">•</span>
                  <span><strong>Cloudinary</strong> for CDN-based image delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Developer</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gourab Mullick</h3>
              <p className="text-gray-600">Full Stack Developer • West Bengal, India</p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex justify-center gap-4 flex-wrap mb-6">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-500"
                >
                  <Icon className="text-xl text-gray-600 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-600">{label}</span>
                </a>
              ))}
            </div>
            
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
              Passionate about building secure, scalable fintech solutions that make banking accessible and user-friendly for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}