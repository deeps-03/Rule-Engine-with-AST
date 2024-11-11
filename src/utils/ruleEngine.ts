import { Node } from '../types/Node';

// Function to create a rule from a string
export function createRule(ruleString: string): Node {
  const tokens = tokenize(ruleString);
  if (tokens.length === 0) {
    throw new Error('Invalid rule string: No tokens found');
  }
  return parseExpression(tokens);
}

// Function to combine multiple rules into a single rule
export function combineRules(rules: string[]): Node {
  if (rules.length === 0) {
    throw new Error('No rules provided to combine');
  }
  
  const parsedRules = rules.map(rule => {
    try {
      return createRule(rule);
    } catch (error) {
      console.error(`Error creating rule from string "${rule}":`, error.message); // Log any errors during rule creation
      throw error; // Rethrow the error after logging
    }
  });

  const combinedRule = parsedRules.reduce((acc, rule) => ({
    type: 'operator',
    operator: 'AND',
    left: acc,
    right: rule,
  }));

  console.log('Combined Rule:', JSON.stringify(combinedRule)); // Log the combined rule
  return combinedRule;
}

// Function to evaluate a rule against the provided data
export function evaluateRule(node: Node, data: Record<string, any>): { result: boolean, ruleResult: boolean } {
  console.log('Evaluating node:', node); // Log the current node being evaluated

  if (node.type === 'operand') {
    const { attribute, operator, value } = node;
    const dataValue = data[attribute!];
    console.log(`Evaluating operand: ${attribute} ${operator} ${value} against ${dataValue}`); // Log the evaluation
    let result: boolean;
    switch (operator) {
      case '>': result = dataValue > value; break;
      case '<': result = dataValue < value; break;
      case '=': result = dataValue === value; break; // Handle equality check
      case '>=': result = dataValue >= value; break;
      case '<=': result = dataValue <= value; break;
      default: throw new Error(`Unknown operator: ${operator}`);
    }
    return { result, ruleResult: true }; // Return true for successful operand evaluation
  } else {
    const leftResult = evaluateRule(node.left!, data);
    const rightResult = evaluateRule(node.right!, data);
    console.log(`Evaluating operator: ${node.operator} with results ${leftResult.result} and ${rightResult.result}`); // Log operator evaluation
    let result: boolean;
    switch (node.operator) {
      case 'AND':
        result = leftResult.result && rightResult.result;
        break;
      case 'OR':
        result = leftResult.result || rightResult.result;
        break;
      default:
        throw new Error(`Unknown operator: ${node.operator}`);
    }
    return { result, ruleResult: leftResult.ruleResult && rightResult.ruleResult }; // Return combined result
  }
}

// Function to tokenize the rule string into components
function tokenize(ruleString: string): string[] {
  return ruleString.match(/\(|\)|\w+|[<>=]+|\d+|'[^']*'/g) || [];
}

// Function to parse tokens into an expression tree
function parseExpression(tokens: string[]): Node {
  if (tokens.length === 0) {
    throw new Error('No tokens to parse');
  }

  if (tokens[0] === '(') {
    const closingIndex = findClosingParenthesis(tokens);
    const innerExpression = tokens.slice(1, closingIndex);
    const parsedInner = parseExpression(innerExpression);

    if (closingIndex === tokens.length - 1) {
      return parsedInner;
    }

    const operator = tokens[closingIndex + 1];
    const right = parseExpression(tokens.slice(closingIndex + 2));

    return {
      type: 'operator',
      operator,
      left: parsedInner,
      right,
    };
  }

  if (tokens.length === 3) {
    return {
      type: 'operand',
      attribute: tokens[0],
      operator: tokens[1],
      value: isNaN(Number(tokens[2])) ? tokens[2].replace(/'/g, '') : Number(tokens[2]),
    };
  }

  const leftOperand = {
    type: 'operand',
    attribute: tokens[0],
    operator: tokens[1],
    value: isNaN(Number(tokens[2])) ? tokens[2].replace(/'/g, '') : Number(tokens[2]),
  };

  const operator = tokens[3];
  const right = parseExpression(tokens .slice(4));

  return {
    type: 'operator',
    operator,
    left: leftOperand,
    right,
  };
}

// Function to find the closing parenthesis in a token array
function findClosingParenthesis(tokens: string[]): number {
  let count = 1;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i] === '(') count++;
    if (tokens[i] === ')') count--;
    if (count === 0) return i;
  }
  throw new Error('Mismatched parentheses');
}