// Backend - src/backend/server.js
import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const scoresFilePath = path.join(__dirname, '../data/scores.json');

const defaultScores = {
  'Exam 1': { judge: 0, member: 0, interaction: 0 },
  'Exam 2': { judge: 0, member: 0, interaction: 0 },
  'Exam 3': { judge: 0, member: 0, interaction: 0 },
  'Exam 4': { judge: 0, member: 0, interaction: 0 },
  'Exam 5': { judge: 0, member: 0, interaction: 0 },
  'Exam 6': { judge: 0, member: 0, interaction: 0 },
  'Exam 7': { judge: 0, member: 0, interaction: 0 }
};

const initializeScoresFile = async () => {
  
  try {
    await fs.access(scoresFilePath);
  } catch {
    await fs.writeFile(scoresFilePath, JSON.stringify(defaultScores, null, 2), 'utf-8');
  }
};

const router = express.Router();

router.post('/submit-scores', async (req, res) => {
  const { scores } = req.body;
  try {
    await fs.writeFile(scoresFilePath, JSON.stringify(scores, null, 2), 'utf-8');
    res.json({ message: 'Scores saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving scores', error });
  }
});

router.get('/get-scores', async (req, res) => {
  try {
    let scores = defaultScores;
    console.log("🚀 ~ app.get ~ scores:", scores)
    try {
      const data = await fs.readFile(scoresFilePath, 'utf-8');
      scores = JSON.parse(data);
    } catch {
      await fs.writeFile(scoresFilePath, JSON.stringify(defaultScores, null, 2), 'utf-8');
    }
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Error reading scores', error });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const accountsData = await fs.readFile(path.join(__dirname, '../data/accounts.json'), 'utf-8');
    const accounts = JSON.parse(accountsData);
    
    const user = accounts.find(acc => acc.email === email && acc.password === password);
    
    if (user) {
      // Create a simple token (should use JWT in practice)
      const token = Buffer.from(`${email}-${Date.now()}`).toString('base64');
      
      res.json({
        success: true,
        user: {
          email: user.email,
          role: user.role
        },
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
});

// Middleware to check token
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  // Should verify JWT token in practice
  next();
};

// Add middleware for protected routes
router.get('/get-scores', authMiddleware, async (req, res) => {
  try {
    let scores = defaultScores;
    console.log("🚀 ~ app.get ~ scores:", scores)
    try {
      const data = await fs.readFile(scoresFilePath, 'utf-8');
      scores = JSON.parse(data);
    } catch {
      await fs.writeFile(scoresFilePath, JSON.stringify(defaultScores, null, 2), 'utf-8');
    }
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Error reading scores', error });
  }
});

router.post('/submit-scores', authMiddleware, async (req, res) => {
  const { scores } = req.body;
  try {
    await fs.writeFile(scoresFilePath, JSON.stringify(scores, null, 2), 'utf-8');
    res.json({ message: 'Scores saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving scores', error });
  }
});
router.get('/scoring-status', authMiddleware, async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../data/config.json');
    let config = { isLocked: false };
    
    try {
      const data = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(data);
    } catch {
      await fs.writeFile(configPath, JSON.stringify(config), 'utf-8');
    }
    
    res.json({ isLocked: config.isLocked });
  } catch (error) {
    res.status(500).json({ message: 'Error getting lock status', error });
  }
});
app.use('/api', router);

app.use(express.static(path.join(__dirname, '../../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

app.listen(5000, async () => {
  await initializeScoresFile();
  console.log('Server running on port 5000');
});
