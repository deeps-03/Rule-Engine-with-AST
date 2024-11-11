import express from 'express';
import sqlite3 from 'sqlite3';
import { createRule, combineRules, evaluateRule } from '../utils/ruleEngine';
import { Node } from '../types/Node';

const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    rule_string TEXT
  )`);
});

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});

// Endpoint to add a new rule
app.post('/api/rules', (req, res) => {
  const { name, ruleString } = req.body;

  // Validate input
  if (!name || !ruleString) {
    return res.status(400).json({ error: 'Both name and rule string are required.' });
  }

  db.run('INSERT INTO rules (name, rule_string) VALUES (?, ?)', [name, ruleString], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, ruleString });
  });
});

// Endpoint to get all rules
app.get('/api/rules', (req, res) => {
  db.all('SELECT * FROM rules', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('Retrieved rules:', rows); // Log retrieved rules for verification
    res.json(rows);
  });
});

// Endpoint to evaluate rules
app.post('/api/evaluate', (req, res) => {
  const { ruleIds, data } = req.body;

  // Validate input
  if (!Array.isArray(ruleIds) || ruleIds.length === 0) {
    return res.status(400).json({ error: 'Rule IDs must be a non-empty array.' });
  }
  if (typeof data !== 'object' || data === null) {
    return res.status(400).json({ error: 'Data must be a valid JSON object.' });
  }

  // Log the incoming request data
  console.log('Evaluating rules with IDs:', ruleIds);
  console.log('Data for evaluation:', data);

  db.all('SELECT rule_string FROM rules WHERE id IN (' + ruleIds.map(() => '?').join(',') + ')', ruleIds, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const ruleStrings = rows.map((row: any) => row.rule_string);
    
    if (ruleStrings.length === 0) {
      return res.status(404).json({ error: 'No rules found for the provided IDs.' });
    }

    try {
      const combinedRule = combineRules(ruleStrings);
      console.log('Combined Rule:', JSON.stringify(combinedRule)); // Log the combined rule
      const result = evaluateRule(combinedRule, data);
      res.json({ result });
    } catch (error) {
      console.error('Error during rule evaluation:', error); // Log the error
      res.status(500).json({ error: error.message });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});