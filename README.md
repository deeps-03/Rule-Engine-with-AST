# Rule Engine with AST

## Overview

This project implements a 3-tier rule engine system that determines user eligibility based on attributes such as age, department, income, and spend. The system uses an Abstract Syntax Tree (AST) to represent conditional rules dynamically and allows for the creation, combination, and modification of these rules.


## Architecture
This project follows a 3-tier architecture:

Simple UI: Interface for creating, combining, and modifying rules.
API and Backend: Handles rule creation, combination, and evaluation.
Data Storage: Stores the rules and metadata in a database.

The rules are represented as an Abstract Syntax Tree (AST) where each node can be either:

Operator Node: Represents a logical operator (AND/OR).
Operand Node: Represents conditions (e.g., age > 30, department = 'Sales').

## Prerequisites

Node.js (v14 or later)
npm (v6 or later)


## Data Storage

The rules and metadata are stored in a relational database. Below is the example schema for storing rules:

### Rule Table Schema:
| Field       | Type   | Description                         |
|-------------|--------|-------------------------------------|
| `rule_id`   | INT    | Primary key, unique ID for the rule |
| `rule_string` | TEXT  | The rule in string format           |
| `ast_json`  | JSON   | JSON representation of the AST      |

### Example of Data:

| `rule_id` | `rule_string`                                      | `ast_json`                          |
|-----------|----------------------------------------------------|-------------------------------------|
| 1         | `age > 30 AND department = 'Sales'`                | {"type": "operator", "value": "AND", "left": ...}         |
| 2         | `age < 25 AND department = 'Marketing'`            | {"type": "operator", "value": "AND", "right": ...}        |




### Installation

npm install
npm run dev




### Error Handling and Validation
Invalid rule strings: The system will return a validation error for missing operators or invalid comparisons.
Attribute validation: Only predefined attributes (e.g., age, department, salary) are allowed.

## Features

* Dynamic creation and modification of conditional rules.
* Abstract Syntax Tree (AST) representation of rules.
* API to evaluate user attributes against predefined rules.
* Supports various attributes like age, department, salary, and experience.

![Rule Engine UI](./screenshots/RuleEngine1.jpg)

![Rule Engine UI](./screenshots/RuleEngine2.jpg)



