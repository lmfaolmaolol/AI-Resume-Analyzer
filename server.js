import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/analyze', async (req, res) => {
    try {
        const { jobDescription, resume } = req.body;

        const prompt = `Evaluate the following resume based on the provided job description. Grade the resume on a scale of 1-10 for the following aspects: 
1. Skill Match 
2. Experience Relevance 
3. Overall Fit.

Job Description:
${jobDescription}

Resume:
${resume}

Provide a short explanation for each score. Keep the result professional and don't add *'s`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        res.json({ analysis: response });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze resume' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});