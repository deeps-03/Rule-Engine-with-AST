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
    return Promise.resolve({ result });
  }
};

function App() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleString, setNewRuleString] = useState('');
  const [evaluationData, setEvaluationData] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<boolean | null>(null);
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
    try {
      await mockApi.addRule({ name: newRuleName, rule_string: newRuleString });
      setNewRuleName('');
      setNewRuleString('');
      fetchRules();
    } catch (error) {
      console.error('Error adding rule:', error);
      setError('Failed to add rule. Please try again.');
    }
  };

  const handleDeleteRule = async (id: number) => {
    try {
      await mockApi.deleteRule(id);
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      setError('Failed to delete rule. Please try again.');
    }
  };

  const handleEvaluate = async () => {
    try {
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

      const response = await mockApi.evaluateRules(rules.map(r => r.id), data);
      setEvaluationResult(response.result);
      setError(null);
    } catch (error) {
      console.error('Error evaluating rules:', error);
      setError('Failed to evaluate rules. Please check your input and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Rule Engine with AST</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Rule</h2>
        <input
          type="text"
          placeholder="Rule Name"
          value={newRuleName}
          onChange={(e) => setNewRuleName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Rule String"
          value={newRuleString}
          onChange={(e) => setNewRuleString(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={handleAddRule}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <PlusCircle className="mr-2" size={18} />
          Add Rule
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Existing Rules (Minimum 2 rules)</h2>
        {rules.length === 0 ? (
          <p>No rules added yet.</p>
        ) : (
          <ul>
            {rules.map((rule) => (
              <li key={rule.id} className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                <span>{rule.name}: {rule.rule_string}</span>
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Evaluate Rules</h2>
        <textarea
          placeholder="Enter JSON data for evaluation (e.g., {'age': 25, 'department': 'Sales', 'salary': 55000})"
          value={evaluationData}
          onChange={(e) => setEvaluationData(e.target.value)}
          className="w-full p-2 mb-2 border rounded h-32"
        />
        <button
          onClick={handleEvaluate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={rules.length === 0}
        >
          Evaluate
        </button>
        {evaluationResult !== null && (
          <p className="mt-4">
            Evaluation Result: <span className={evaluationResult ? "text-green-600" : "text-red-600"}>
              {evaluationResult ? "True" : "False"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;