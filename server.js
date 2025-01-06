/**
 * Resume Analyzer Server
 * 
 * This module sets up an Express.js server that provides an AI-powered resume analysis endpoint
 * using Google's Gemini AI. It handles CORS, JSON parsing, and serves static files.
 * 
 * @module ResumeAnalyzerServer
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires @google/generative-ai
 */



import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware configuration
// Middleware configuration
app.use(cors({
    origin: [
        'http://127.0.0.1:5500', 
        'https://monkey-sweeping-bug.ngrok-free.app',
        'https://ai-resume-analyzer-one.vercel.app'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));// Enable Cross-Origin Resource Sharing
app.use(express.json());// Parse JSON request bodies
app.use(express.static('.'));// Serve static files from the current directory
// Add logging middleware before CORS
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Origin:', req.get('origin'));
    next();
});

// Initialize Google Generative AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


/**
 * Analyze Resume Endpoint
 * 
 * Receives job description and resume text, uses Gemini AI to evaluate resume
 * and generate a comprehensive analysis.
 * 
 * @route POST /api/analyze
 * @param {Object} req.body - Request body containing job description and resume
 * @param {string} req.body.jobDescription - Detailed job description
 * @param {string} req.body.resume - Resume text to be analyzed
 * @returns {Object} Analysis results including scores and explanations
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { jobDescription, resume } = req.body;
// Detailed prompt for comprehensive resume analysis
        const prompt = `Evaluate the following resume based on the provided job description. Grade the resume on a scale of 1-100 including decimals for the following aspects: 
1. Skill Match 
2. Experience Relevance 
3. Overall Fit.

Job Description:
${jobDescription}

Resume:
${resume}

Provide a short explanation for each score. Keep the result professional and don't add any bold words.The threshold for passing is 70 percent

The overall output should be something like this
Skill Match Score
Explanation

Experience Relevance Score
Explanation

Overall Fit Explantion
Overall Fit Score

Pass or Fail

Things which can be improved


Also do not metion Skill Match explanation, experience relevance explanation etc in the output.
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        res.json({ analysis: response });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze resume' });
    }
});

// Server configuration
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Resume Analyzer Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
