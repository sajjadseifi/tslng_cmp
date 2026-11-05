
# TS Language Compiler

**A custom programming language compiler implemented in TypeScript.**

## Overview

TS Language Compiler is a compiler project focused on the design and implementation of a custom programming language.

The project explores the fundamental stages of compiler construction, including lexical analysis, tokenization, parsing, Abstract Syntax Tree (AST) construction, syntax analysis, and semantic analysis.

It provides a structured approach to processing source code and validating it against a custom language grammar.

## Compiler Pipeline

The compiler is organized around the following stages:

```text
Source Code
     │
     ▼
Lexical Analysis
     │
     ▼
Tokenization
     │
     ▼
Parsing
     │
     ▼
Abstract Syntax Tree (AST)
     │
     ▼
Syntax Analysis
     │
     ▼
Semantic Analysis
```

## Implemented Features

### 1. Lexer / Tokenizer

- Performs lexical analysis on source code.
- Identifies and classifies tokens based on the custom language syntax.
- Converts source text into a structured token sequence for further processing.

### 2. Grammar Definition

- Defines the syntax rules of the custom programming language.
- Establishes the grammar used by the parser to recognize valid language structures.

### 3. Parser / Abstract Syntax Tree

- Parses the token sequence according to the defined grammar.
- Constructs an Abstract Syntax Tree (AST) representing the structure of the source code.

### 4. Syntax Analysis

- Analyzes parsed structures against the language's syntax rules.
- Identifies syntactic structures that do not conform to the defined grammar.

### 5. Semantic Analysis

- Performs semantic validation of parsed language structures.
- Checks source constructs against the semantic rules implemented for the custom language.

## Tech Stack

- **Language:** TypeScript
- **Core Concepts:** Compiler Design, Lexical Analysis, Parsing, Abstract Syntax Trees, Syntax Analysis, Semantic Analysis

## Project Goals

This project was created to explore compiler architecture and gain practical experience with the internal stages of programming language implementation.

Its main focus is understanding how source code is transformed into structured representations and how language rules are applied during syntax and semantic validation.

## Author

**Sajjad Seifi**

- GitHub: [@sajjadseifi](https://github.com/sajjadseifi)
- Repository: [TS Language Compiler](https://github.com/sajjadseifi/tslng_cmp)
