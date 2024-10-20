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

app.post('/api/rules', (req, res) => {
  const { name, ruleString } = req.body;
  db.run('INSERT INTO rules (name, rule_string) VALUES (?, ?)', [name, ruleString], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name, ruleString });
  });
});

app.get('/api/rules', (req, res) => {
  db.all('SELECT * FROM rules', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/evaluate', (req, res) => {
  const { ruleIds, data } = req.body;
  db.all('SELECT rule_string FROM rules WHERE id IN (' + ruleIds.join(',') + ')', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const ruleStrings = rows.map((row: any) => row.rule_string);
    const combinedRule = combineRules(ruleStrings);
    const result = evaluateRule(combinedRule, data);
    res.json({ result });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});