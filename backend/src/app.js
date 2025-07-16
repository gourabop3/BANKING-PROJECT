const express = require('express')
const NotFoudError = require('./middleware/404Handling')
const ApiError = require('./utils/ApiError')
const ValidationMiddleware = require('./middleware/ValidationMiddleware')
const app = express() 
const morgan = require("morgan")
const cors = require("cors")

// CORS Configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    // Always allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Development URLs
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://localhost:3000',
      'https://localhost:3001',
      'http://127.0.0.1:3000',
      'https://127.0.0.1:3000',
      
      // Environment variables
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URI,
      
      // Common deployment platforms - add your actual domains here
      'https://banking-project-frontend.vercel.app',
      'https://banking-project-frontend.netlify.app',
      
      // Vercel and Netlify preview deployments
      /https:\/\/.*\.vercel\.app$/,
      /https:\/\/.*\.netlify\.app$/,
      
      // Add any other production domains here
    ].filter(Boolean); // Remove undefined values
    
    console.log('Request from origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // In development or if no NODE_ENV is set, allow all origins
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.log('Development mode - allowing all origins');
      return callback(null, true);
    }
    
    // For production, temporarily allow all origins to debug CORS issues
    // TODO: Restrict this to specific domains once the frontend domain is known
    console.log('Production mode - allowing all origins temporarily for debugging');
    return callback(null, true);
    
    // Uncomment and modify this when you know your frontend domain:
    /*
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
    */
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-Auth-Token',
    'x-access-token',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200, // for legacy browser support
  preflightContinue: false
};

// # json parsing
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: false, limit: '25mb' }))

// Apply CORS before routes
app.use(cors(corsOptions))

// Handle preflight requests
app.options('/*catchall', cors(corsOptions));

app.use(morgan("dev"))
app.use("/api/v1",require("./router"))
//get
app.get('/', (req, res) => {
  res.send({msg:'Hello World!'})
})
app.use((req,res,next)=>{
    next( new ApiError(404,"Not Found"))
})
 
app.use(NotFoudError) 
module.exports = app