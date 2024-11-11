// src/types/Node.ts
export interface Node {
  type: 'operand' | 'operator';
  operator?: string;
  left?: Node;
  right?: Node;
  attribute?: string;
  value?: any;
}