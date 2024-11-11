import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { createRule, combineRules, evaluateRule } from './utils/ruleEngine';
import { Node } from './types/Node';

interface Rule {
  id: number;
  name: string;
  rule_string: string;
}

// Mock API
const mockApi = {
  rules: [] as Rule[],
  getRules: () => Promise.resolve(mockApi.rules),
  addRule: (rule: Omit<Rule, 'id'>) => {
    const newRule = { ...rule, id: mockApi.rules.length + 1 };
    mockApi.rules.push(newRule);
    return Promise.resolve(newRule);
  },
  deleteRule: (id: number) => {
    mockApi.rules = mockApi.rules.filter(rule => rule.id !== id);
    return Promise.resolve();
  },
  evaluateRules: (ruleIds: number[], data: Record<string, any>) => {
    const selectedRules = mockApi.rules.filter(rule => ruleIds.includes(rule.id));
    const ruleStrings = selectedRules.map(rule => rule.rule_string);
    const combinedRule = combineRules(ruleStrings);
    const result = evaluateRule(combinedRule, data);
    const individualResults = ruleStrings.map((rule, index) => {
      const ruleNode = createRule(rule);
      const ruleResult = evaluateRule(ruleNode, data);
      return {
        rule: rule,
        result: ruleResult.result,
      };
    });
    return Promise.resolve({ finalResult: result, individualResults });
  }
};

function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleString, setNewRuleString] = useState('');
  const [evaluationData, setEvaluationData] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<boolean | null>(null);
  const [individualResults, setIndividualResults] = useState<{ rule: string; result: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const fetchedRules = await mockApi.getRules();
      setRules(fetchedRules);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setError('Failed to fetch rules. Please try again.');
    }
  };

  const handleAddRule = async () => {
    if (!newRuleName || !newRuleString) {
      setError('Both name and rule string are required.');
      return;
    }

    try {
      await mockApi.addRule({ name: newRuleName, rule_string: newRuleString });
      setNewRuleName('');
      setNewRuleString('');
      fetchRules(); // Fetch updated rules after adding a new rule
    } catch (error) {
      console.error('Error adding rule:', error);
      setError('Failed to add rule. Please try again.');
    }
  };

  const handleDeleteRule = async (id: number) => {
    try {
      await mockApi.deleteRule(id);
      fetchRules(); // Fetch updated rules after deleting a rule
    } catch (error) {
      console.error('Error deleting rule:', error);
      setError('Failed to delete rule. Please try again.');
    }
  };

  const handleEvaluate = async () => {
    let data: Record<string, any>;
    try {
      data = JSON.parse(evaluationData);
    } catch (jsonError) {
      setError('Invalid JSON input. Please check your data and try again.');
      return;
    }

    if (rules.length === 0) {
      setError('No rules to evaluate. Please add at least one rule.');
      return;
    }

    try {
      const response = await mockApi.evaluateRules(rules.map(r => r.id), data);
      setEvaluationResult(response.finalResult);
      setIndividualResults(response.individualResults);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error evaluating rules:', error);
      setError('Failed to evaluate rules. Please try again.');
    }
  };

  return (
    <div>
      <h1>Rule Evaluation App</h1>
      {error && <div className="error">{error}</div>}
      <div>
        <input
          type="text"
          placeholder="Rule Name"
          value={newRuleName}
          onChange={(e) => setNewRuleName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Rule String"
          value={newRuleString}
          onChange={(e) => setNewRuleString(e.target.value)}
        />
        <button onClick={handleAddRule}>
          <PlusCircle /> Add Rule
        </button>
      </div>
      <ul>
        {rules.map(rule => (
          <li key={rule.id}>
            {rule.name} - {rule.rule_string}
            <button onClick={() => handleDeleteRule(rule.id)}>
              <Trash2 /> Delete
            </button>
          </li>
        ))}
      </ul>
      <textarea
        placeholder="Enter JSON data"
        value={evaluationData}
        onChange={(e) => setEvaluationData(e.target.value)}
      />
      <button onClick={handleEvaluate}>Evaluate Rules</button>
      {evaluationResult !== null && (
        <div>
          <h2>Evaluation Result: {evaluationResult ? 'True' : 'False'}</h2>
          <h3>Individual Rule Results:</h3>
          <ul>
            {individualResults.map((result, index) => (
              <li key={index}>
                {result.rule} - {result.result ? 'True' : 'False'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;