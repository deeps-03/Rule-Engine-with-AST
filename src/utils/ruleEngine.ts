import { Node } from '../types/Node';

export function createRule(ruleString: string): Node {
  const tokens = tokenize(ruleString);
  return parseExpression(tokens);
}

export function combineRules(rules: string[]): Node {
  const parsedRules = rules.map(createRule);
  return {
    type: 'operator',
    operator: 'AND',
    left: parsedRules[0],
    right: parsedRules.slice(1).reduce((acc, rule) => ({
      type: 'operator',
      operator: 'AND',
      left: acc,
      right: rule,
    })),
  };
}

export function evaluateRule(node: Node, data: Record<string, any>): boolean {
  if (node.type === 'operand') {
    const { attribute, operator, value } = node;
    const dataValue = data[attribute!];
    switch (operator) {
      case '>': return dataValue > value;
      case '<': return dataValue < value;
      case '=': return dataValue === value;
      case '>=': return dataValue >= value;
      case '<=': return dataValue <= value;
      default: throw new Error(`Unknown operator: ${operator}`);
    }
  } else {
    const leftResult = evaluateRule(node.left!, data);
    const rightResult = evaluateRule(node.right!, data);
    switch (node.operator) {
      case 'AND': return leftResult && rightResult;
      case 'OR': return leftResult || rightResult;
      default: throw new Error(`Unknown operator: ${node.operator}`);
    }
  }
}

function tokenize(ruleString: string): string[] {
  return ruleString.match(/\(|\)|\w+|[<>=]+|\d+|'[^']*'/g) || [];
}

function parseExpression(tokens: string[]): Node {
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
  const right = parseExpression(tokens.slice(4));
  
  return {
    type: 'operator',
    operator,
    left: leftOperand,
    right,
  };
}

function findClosingParenthesis(tokens: string[]): number {
  let count = 1;
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i] === '(') count++;
    if (tokens[i] === ')') count--;
    if (count === 0) return i;
  }
  throw new Error('Mismatched parentheses');
}