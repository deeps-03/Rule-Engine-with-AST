# Rule Engine with AST

## Overview

This project implements a 3-tier rule engine system that determines user eligibility based on attributes such as age, department, income, and spending. The system uses an Abstract Syntax Tree (AST) to dynamically represent conditional rules and allows for the creation, combination, and modification of these rules. Additionally, the new feature enables individual feature evaluation, providing detailed insights alongside the overall evaluation.

## Architecture

This project follows a 3-tier architecture:

1. **Simple UI**: An interface for creating, combining, and modifying rules.
2. **API and Backend**: Handles rule creation, combination, and evaluation.
3. **Data Storage**: Stores the rules and metadata in a relational database.

The rules are represented as an Abstract Syntax Tree (AST), where each node can be either:

- **Operator Node**: Represents a logical operator (AND/OR).
- **Operand Node**: Represents conditions (e.g., age > 30, department = 'Sales').


## New Feature: Individual Feature Evaluation

The new feature allows for the evaluation of individual features (such as age, department, salary) separately, in addition to the overall evaluation. This helps provide more granular feedback about which specific conditions are met or not met, allowing users to understand why a rule passes or fails based on individual criteria.

### Example:

If a rule is `age > 30 AND department = 'Sales'`, the system will provide the following evaluations:

- **Age Evaluation**: `Passed` if age > 30, `Failed` otherwise.
- **Department Evaluation**: `Passed` if department = 'Sales', `Failed` otherwise.
- **Overall Evaluation**: Combines the results of the individual evaluations and provides a final `Passed` or `Failed` result.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)


## Data Storage

The rules and metadata are stored in a relational database. Below is an example schema for storing rules:

### Rule Table Schema:

| Field         | Type  | Description                               |
|---------------|-------|-------------------------------------------|
| `rule_id`     | INT   | Primary key, unique ID for the rule      |
| `rule_string` | TEXT  | The rule in string format                |
| `ast_json`    | JSON  | JSON representation of the AST          |

### Example Data:

| `rule_id` | `rule_string`                         | `ast_json`                                                                 |
|-----------|---------------------------------------|---------------------------------------------------------------------------|
| 1         | `age > 30 AND department = 'Sales'`   | `{"type": "operator", "value": "AND", "left": ...}`                      |
| 2         | `age < 25 AND department = 'Marketing'` | `{"type": "operator", "value": "AND", "right": ...}`                     |



## Docker Usage

To run the application using Docker, follow these steps:

1. **Build the Docker image and Start the application:**:
```bash
   docker-compose up --build -d  
```

2. Access the application: Open your web browser and go to http://localhost:5173/ to access the UI.


3. **Stop the Docker container:**:
```bash
docker-compose down
```

4. **To rebuild and restart the application:**:
```bash
docker-compose up --build -d
```


## Docker Hub Link

Link: https://hub.docker.com/repository/docker/deepaksuresh03/rule-engine-with-ast/general



## Installation

**To install the project locally (not using Docker), run the following commands:**

```bash
npm install
npm run dev
```
This will start the application in development mode.


## Testing the Application

### Example Rules:

You can test the application with the following example rules:

#### Rule1: 
```bash 
((age > 30 AND department = "Marketing")) AND (salary > 20000 OR experience > 5)
```

#### Rule2:
```bash
((age > 30 AND (department = "Sales" OR department = "Marketing")) OR (age < 25 AND department = "Marketing")) AND (salary > 50000 OR experience > 5)
```

### Input for Evaluation

You can use the following JSON input for evaluation:

```bash
{
  "age": 40,
  "department": "Marketing",
  "salary": 48000,
  "experience": 12
}
```


## Error Handling and Validation

**Invalid Rule Strings**: The system is designed to return a validation error for invalid rule strings, such as those that are missing operators or contain invalid comparisons. This is evident from the error handling implemented in the createRule and combineRules functions, which throw errors for invalid inputs.

**Attribute Validation**: The project specifies that only predefined attributes (like age, department, salary) are allowed for rule creation and evaluation. Although the code does not explicitly show the validation for predefined attributes, it is implied in the context that the rules are designed to work with specific attributes.

Overall, the project includes mechanisms for handling errors related to rule creation and evaluation, ensuring that only valid rules are processed.


## Conclusion

This Rule Engine with AST project provides a flexible way to evaluate rules based on user attributes. It allows for dynamic rule creation and modification, making it adaptable to various eligibility criteria. The addition of individual feature evaluation enhances transparency and helps users understand the specific criteria being evaluated.
