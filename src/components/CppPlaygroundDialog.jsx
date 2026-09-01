import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  ContentCopy as CopyIcon,
  Terminal as TerminalIcon,
  Refresh as ResetIcon,
  GetApp as DownloadIcon,
  FileUpload as UploadIcon,
  Memory as MemoryIcon,
  ViewSidebar as SplitIcon,
  FastForward as StepNextIcon,
  FastRewind as StepPrevIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import html2canvas from 'html2canvas';
import { traceCppExecution } from './cppMemoryTracer';
import { CppMemoryInspectorView } from './CppMemoryInspectorView';
import { convertCppToPseudocode } from './cppFlowchartEngine';
import { CppFlowchartRenderer } from './CppFlowchartRenderer';

const validateCppSyntax = (cppCode) => {
  let line = 1;
  let braceStack = [];
  let parenStack = [];
  let inString = false;
  let inChar = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < cppCode.length; i++) {
    const char = cppCode[i];

    if (char === '\n') {
      line++;
      if (inLineComment) {
        inLineComment = false;
      }
    }

    if (inLineComment) continue;
    if (inBlockComment) {
      if (char === '/' && cppCode[i - 1] === '*') {
        inBlockComment = false;
      }
      continue;
    }

    if (inString) {
      if (char === '"' && cppCode[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (inChar) {
      if (char === "'" && cppCode[i - 1] !== '\\') {
        inChar = false;
      }
      continue;
    }

    // Check for comments
    if (char === '/' && cppCode[i + 1] === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === '/' && cppCode[i + 1] === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    // Check for literals
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "'") {
      inChar = true;
      continue;
    }

    // Check braces/parens
    if (char === '{') {
      braceStack.push({ line, col: i + 1 });
    } else if (char === '}') {
      if (braceStack.length === 0) {
        throw new Error(`Syntax Error: Mismatched closing brace '}' on line ${line}. Suggestion: Check if you have an extra '}' or are missing an opening '{' before this line.`);
      }
      braceStack.pop();
    } else if (char === '(') {
      parenStack.push({ line, col: i + 1 });
    } else if (char === ')') {
      if (parenStack.length === 0) {
        throw new Error(`Syntax Error: Mismatched closing parenthesis ')' on line ${line}. Suggestion: Check if you have an extra ')' or are missing an opening '(' before this line.`);
      }
      parenStack.pop();
    }
  }

  if (inBlockComment) {
    throw new Error(`Syntax Error: Unclosed block comment (/*) starting before the end of the file. Suggestion: Add '*/' to close it.`);
  }
  if (inString) {
    throw new Error(`Syntax Error: Unclosed string literal before the end of the file. Suggestion: Add a closing double quote (") on the same line.`);
  }
  if (braceStack.length > 0) {
    const unclosed = braceStack.pop();
    throw new Error(`Syntax Error: Unclosed curly brace '{' starting on line ${unclosed.line}. Suggestion: Add a matching closing brace '}' to close this code block.`);
  }
  if (parenStack.length > 0) {
    const unclosed = parenStack.pop();
    throw new Error(`Syntax Error: Unclosed parenthesis '(' starting on line ${unclosed.line}. Suggestion: Add a matching closing parenthesis ')' to close this expression.`);
  }

  // Safety parse clean code
  let cleanCode = cppCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const stringLiterals = [];
  cleanCode = cleanCode.replace(/"(\\.|[^"\\])*"/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });
  cleanCode = cleanCode.replace(/'(\\.|[^'\\])*'/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });

  // Entry point check
  const mainBodyMatch = /int\s+main\s*\(\s*\)\s*\{([\s\S]*)\}/.exec(cleanCode);
  if (!mainBodyMatch) {
    throw new Error("Syntax Error: Missing 'int main()' entry point. Suggestion: Every runnable C++ program requires an entry point. Ensure you declare 'int main() { ... }'.");
  }
  const body = mainBodyMatch[1].trim();

  // Validate identifiers
  const varDeclRegex = /\b(int|double|float|string|std::string|bool|char|auto)\s+([^;()]+);/g;
  let varMatch;
  varDeclRegex.lastIndex = 0;
  while ((varMatch = varDeclRegex.exec(body)) !== null) {
    const declBody = varMatch[2].trim();
    const parts = declBody.split(",");
    for (let part of parts) {
      const cleanName = part.split("=")[0].split("[")[0].trim();
      if (cleanName.length > 0) {
        if (!/^[A-Za-z_]+[0-9]*$/.test(cleanName)) {
          const varIndex = cppCode.indexOf(varMatch[0]);
          let varLine = 1;
          if (varIndex !== -1) {
            varLine = cppCode.substring(0, varIndex).split('\n').length;
          }
          throw new Error(`Syntax Error: Variable name '${cleanName}' on line ${varLine} is not a valid C++ identifier. Suggestion: C++ variable names must consist of letters and underscores only, with numbers allowed only at the very end (no digits in the middle, no special characters).`);
        }
      }
    }
  }
};

const translateCppToJs = (cppCode, inputStr) => {
  validateCppSyntax(cppCode);

  // 1. Clean comments
  let code = cppCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Replace string and character literals with placeholders to make translation safe
  const stringLiterals = [];
  code = code.replace(/"(\\.|[^"\\])*"/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });
  code = code.replace(/'(\\.|[^'\\])*'/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });

  // 2. Find int main()
  const mainBodyMatch = /int\s+main\s*\(\s*\)\s*\{([\s\S]*)\}/.exec(code);
  let body = mainBodyMatch[1].trim();

  // 3. Remove standard return statement
  body = body.replace(/\breturn\s+0\s*;/g, "");

  // 4. Set up helper variables and context in the generated JS
  let js = `
    const stdout = [];
    let _precision = -1;
    const fixed = "";
    const setprecision = (n) => {
      _precision = n;
      return "";
    };
    
    const printHelper = (val) => {
      if (val === undefined || val === "") return;
      if (typeof val === 'number' && _precision >= 0) {
        stdout.push(val.toFixed(_precision));
      } else {
        stdout.push(val === null ? "null" : val);
      }
    };

    const inputTokens = ${JSON.stringify(inputStr.trim().split(/\s+/).filter(t => t.length > 0))};
    let inputPtr = 0;
    
    const nextInputToken = () => {
      if (inputPtr >= inputTokens.length) return "";
      return inputTokens[inputPtr++];
    };

    const readInput = () => {
      const token = nextInputToken();
      if (!token) return "";
      if (/^-?\\d+(\\.\\d+)?$/.test(token)) {
        return parseFloat(token);
      }
      return token;
    };
  `;

  // Array replacements first
  body = body.replace(/\b(int|double|float|string|bool|char|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]+)\}\s*;/g, 'let $2 = [$3];');
  body = body.replace(/\b(int|double|float|string|bool|char|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*([^\]]+)\s*\]\s*;/g, 'let $2 = new Array($3).fill(0);');

  // Range-based for loop: for (Type val : collection) -> for (let val of collection)
  body = body.replace(/for\s*\(\s*(int|double|float|string|bool|char|auto)\s+([a-zA-Z0-9_$]+)\s*:\s*([^)]+)\)/g, 'for (let $2 of $3)');

  // Type casts: (double)(val) -> Number(val)
  body = body.replace(/\((double|float)\)\s*\(([^)]+)\)/g, 'Number($2)');
  body = body.replace(/\((double|float)\)\s*([a-zA-Z0-9_$.]+(?:\([^)]*\))?)/g, 'Number($2)');
  body = body.replace(/\(int\)\s*\(([^)]+)\)/g, 'Math.trunc($1)');
  body = body.replace(/\(int\)\s*([a-zA-Z0-9_$.]+(?:\([^)]*\))?)/g, 'Math.trunc($1)');

  // 5. Clean namespace prefixes
  body = body.replace(/std::cout/g, "cout").replace(/std::cin/g, "cin").replace(/std::endl/g, "endl");
  body = body.replace(/\.length\s*\(\s*\)/g, ".length").replace(/\.size\s*\(\s*\)/g, ".length");

  // 6. Translate C++ variable declarations
  const types = ['int', 'double', 'float', 'string', 'bool', 'char', 'auto'];
  types.forEach(type => {
    const regex = new RegExp(`\\b${type}\\b`, 'g');
    body = body.replace(regex, 'let');
  });

  // 7. Translate cin >> var1 >> var2;
  const cinRegex = /cin\s*(>>\s*[a-zA-Z_][a-zA-Z0-9_]*\s*)+;/g;
  body = body.replace(cinRegex, (match) => {
    const vars = match.split('>>').slice(1).map(v => v.replace(/;$/, '').trim());
    return vars.map(v => `${v} = readInput();`).join(' ');
  });

  // 8. Translate cout << var1 << "string" << endl;
  const coutRegex = /cout\s*(<<\s*[^;]+)+;/g;
  body = body.replace(coutRegex, (match) => {
    const parts = match.split('<<').slice(1).map(p => p.replace(/;$/, '').trim());
    const pushes = parts.map(part => {
      if (part === 'endl' || part === '"\\n"' || part === "'\\n'") {
        return `stdout.push("\\n");`;
      }
      return `printHelper(${part});`;
    });
    return pushes.join(' ');
  });

  // Append translated body
  js += "\n" + body;
  js += `\nreturn stdout.join("");`;

  // Restore string literals
  stringLiterals.forEach((str, idx) => {
    js = js.replace(new RegExp(`__STR_LITERAL_${idx}__`, 'g'), str);
  });

  return js;
};

const parseClassAttributes = (javaCode) => {
  let cleanCode = javaCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const attributes = [];
  const classDeclRegex = /class\s+([A-Za-z0-9_]+)/g;
  let match;

  while ((match = classDeclRegex.exec(cleanCode)) !== null) {
    const searchStart = match.index + match[0].length;
    const openBraceIdx = cleanCode.indexOf("{", searchStart);
    if (openBraceIdx === -1) continue;

    let depth = 1;
    let closeBraceIdx = -1;
    for (let i = openBraceIdx + 1; i < cleanCode.length; i++) {
      if (cleanCode[i] === '{') depth++;
      else if (cleanCode[i] === '}') {
        depth--;
        if (depth === 0) {
          closeBraceIdx = i;
          break;
        }
      }
    }
    if (closeBraceIdx === -1) continue;

    const classBody = cleanCode.substring(openBraceIdx + 1, closeBraceIdx);

    let accumulated = "";
    let bodyDepth = 0;

    for (let charIdx = 0; charIdx < classBody.length; charIdx++) {
      const char = classBody[charIdx];
      if (char === '{') {
        bodyDepth++;
      } else if (char === '}') {
        bodyDepth--;
      } else if (char === ';') {
        if (bodyDepth === 0) {
          const stmt = accumulated.trim();
          if (stmt && !stmt.includes('(')) {
            const attrRegex = /^(?:public|private|protected|static|final)?\s*([A-Za-z0-9_<>[\]]+)\s+([A-Za-z0-9_]+)/;
            const m = attrRegex.exec(stmt);
            if (m) {
              const typeCandidate = m[1];
              if (!['return', 'throw', 'new', 'import', 'package', 'class', 'extends', 'implements'].includes(typeCandidate)) {
                attributes.push(m[2]);
              }
            }
          }
          accumulated = "";
        }
      } else {
        if (bodyDepth === 0) {
          accumulated += char;
        }
      }
    }
  }
  return [...new Set(attributes)];
};

const cleanParamTypes = (paramStr) => {
  if (!paramStr || !paramStr.trim()) return "";
  if (paramStr.includes('args') && (paramStr.includes('String') || paramStr.includes('[]'))) {
    return "args";
  }
  return paramStr.split(',').map(p => {
    const parts = p.trim().split(/\s+/);
    return parts[parts.length - 1];
  }).join(', ');
};

const processClassCode = (classCode, attributes) => {
  let processedCode = "";
  let lastIndex = 0;
  const headerRegex = /\b(constructor|[a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/g;
  let match;

  while ((match = headerRegex.exec(classCode)) !== null) {
    const matchIndex = match.index;
    const header = match[0];
    const paramStr = match[2];

    // 1. Process block before method (e.g. class declarations, fields)
    let beforeMethod = classCode.substring(lastIndex, matchIndex);
    attributes.forEach(attr => {
      const regex = new RegExp(`(?<!this\\.|let\\s+|const\\s+|var\\s+|class\\s+|extends\\s+|new\\s+|public\\s+|private\\s+|protected\\s+|\\.\\s*)\\b${attr}\\b`, 'g');
      beforeMethod = beforeMethod.replace(regex, `this.${attr}`);
    });
    processedCode += beforeMethod;

    // 2. Find matching closing brace for the method
    const startBraceIdx = matchIndex + header.length - 1;
    let depth = 1;
    let endBraceIdx = -1;
    for (let i = startBraceIdx + 1; i < classCode.length; i++) {
      if (classCode[i] === '{') depth++;
      else if (classCode[i] === '}') {
        depth--;
        if (depth === 0) {
          endBraceIdx = i;
          break;
        }
      }
    }

    if (endBraceIdx === -1) {
      break;
    }

    let body = classCode.substring(startBraceIdx + 1, endBraceIdx);

    // 3. Find parameters of this method/constructor
    const params = paramStr.split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // 4. Find local variables declared in body
    const localVars = [];
    const localVarRegex = /\b(?:let|const|var)\s+([a-zA-Z0-9_]+)\b/g;
    let localVarMatch;
    while ((localVarMatch = localVarRegex.exec(body)) !== null) {
      localVars.push(localVarMatch[1]);
    }

    const shadowed = new Set([...params, ...localVars]);

    // 5. Replace references to attributes, skipping shadowed ones
    attributes.forEach(attr => {
      if (!shadowed.has(attr)) {
        const regex = new RegExp(`(?<!this\\.|let\\s+|const\\s+|var\\s+|class\\s+|extends\\s+|new\\s+|public\\s+|private\\s+|protected\\s+|\\.\\s*)\\b${attr}\\b`, 'g');
        body = body.replace(regex, `this.${attr}`);
      }
    });

    processedCode += header + body + "}";
    lastIndex = endBraceIdx + 1;
    headerRegex.lastIndex = lastIndex;
  }

  let remaining = classCode.substring(lastIndex);
  attributes.forEach(attr => {
    const regex = new RegExp(`(?<!this\\.|let\\s+|const\\s+|var\\s+|class\\s+|extends\\s+|new\\s+|public\\s+|private\\s+|protected\\s+|\\.\\s*)\\b${attr}\\b`, 'g');
    remaining = remaining.replace(regex, `this.${attr}`);
  });
  processedCode += remaining;

  return processedCode;
};

const extractMainMethodBodyFromRunner = (runnerCode) => {
  const cleanCode = runnerCode.trim();

  // Try to find void main method
  const mainMethodRegex = /(?:\bpublic\s+|\bstatic\s+|\bprivate\s+|\bprotected\s+)*void\s+main\s*\([^)]*\)\s*\{/;
  const match = mainMethodRegex.exec(cleanCode);

  if (match) {
    const mainOpenBraceIdx = match.index + match[0].length - 1;
    let mainDepth = 1;
    let mainCloseBraceIdx = -1;
    for (let i = mainOpenBraceIdx + 1; i < cleanCode.length; i++) {
      if (cleanCode[i] === '{') mainDepth++;
      else if (cleanCode[i] === '}') {
        mainDepth--;
        if (mainDepth === 0) {
          mainCloseBraceIdx = i;
          break;
        }
      }
    }
    if (mainCloseBraceIdx !== -1) {
      return cleanCode.substring(mainOpenBraceIdx + 1, mainCloseBraceIdx).trim();
    }
  }

  // Try to find class Runner body
  const runnerClassRegex = /(?:public\s+)?class\s+Runner\s*(?:extends\s+\w+)?\s*\{/;
  const classMatch = runnerClassRegex.exec(cleanCode);
  if (classMatch) {
    const openBraceIdx = classMatch.index + classMatch[0].length - 1;
    let depth = 1;
    let closeBraceIdx = -1;
    for (let i = openBraceIdx + 1; i < cleanCode.length; i++) {
      if (cleanCode[i] === '{') depth++;
      else if (cleanCode[i] === '}') {
        depth--;
        if (depth === 0) {
          closeBraceIdx = i;
          break;
        }
      }
    }
    if (closeBraceIdx !== -1) {
      const runnerBody = cleanCode.substring(openBraceIdx + 1, closeBraceIdx).trim();
      const subMatch = mainMethodRegex.exec(runnerBody);
      if (subMatch) {
        const subOpenBraceIdx = subMatch.index + subMatch[0].length - 1;
        let subDepth = 1;
        let subCloseBraceIdx = -1;
        for (let i = subOpenBraceIdx + 1; i < runnerBody.length; i++) {
          if (runnerBody[i] === '{') subDepth++;
          else if (runnerBody[i] === '}') {
            subDepth--;
            if (subDepth === 0) {
              subCloseBraceIdx = i;
              break;
            }
          }
        }
        if (subCloseBraceIdx !== -1) {
          return runnerBody.substring(subOpenBraceIdx + 1, subCloseBraceIdx).trim();
        }
      }
      return runnerBody;
    }
  }

  return cleanCode;
};

const extractMainMethodBody = (javaCode) => {
  const cleanCode = javaCode;
  const runnerClassRegex = /(?:public\s+)?class\s+Runner\s*(?:extends\s+\w+)?\s*\{/;
  const match = runnerClassRegex.exec(cleanCode);
  if (!match) {
    return { mainBody: "", remainingCode: javaCode };
  }

  const runnerStartIdx = match.index;
  const openBraceIdx = match.index + match[0].length - 1;

  let depth = 1;
  let runnerCloseBraceIdx = -1;
  for (let i = openBraceIdx + 1; i < cleanCode.length; i++) {
    if (cleanCode[i] === '{') depth++;
    else if (cleanCode[i] === '}') {
      depth--;
      if (depth === 0) {
        runnerCloseBraceIdx = i;
        break;
      }
    }
  }

  if (runnerCloseBraceIdx === -1) {
    return { mainBody: "", remainingCode: javaCode };
  }

  const runnerBody = cleanCode.substring(openBraceIdx + 1, runnerCloseBraceIdx);
  const mainMethodRegexSimple = /void\s+main\s*\([^)]*\)\s*\{/;
  const mainMatch = mainMethodRegexSimple.exec(runnerBody);
  if (!mainMatch) {
    const remainingCode = javaCode.substring(0, runnerStartIdx) + javaCode.substring(runnerCloseBraceIdx + 1);
    return { mainBody: "", remainingCode };
  }

  const mainOpenBraceIdx = mainMatch.index + mainMatch[0].length - 1;
  let mainDepth = 1;
  let mainCloseBraceIdx = -1;
  for (let i = mainOpenBraceIdx + 1; i < runnerBody.length; i++) {
    if (runnerBody[i] === '{') mainDepth++;
    else if (runnerBody[i] === '}') {
      mainDepth--;
      if (mainDepth === 0) {
        mainCloseBraceIdx = i;
        break;
      }
    }
  }

  if (mainCloseBraceIdx === -1) {
    const remainingCode = javaCode.substring(0, runnerStartIdx) + javaCode.substring(runnerCloseBraceIdx + 1);
    return { mainBody: "", remainingCode };
  }

  const mainBody = runnerBody.substring(mainOpenBraceIdx + 1, mainCloseBraceIdx).trim();
  const remainingCode = javaCode.substring(0, runnerStartIdx) + javaCode.substring(runnerCloseBraceIdx + 1);

  return { mainBody, remainingCode };
};

const translateJavaToJs = (javaCode, inputStr) => {
  let code = javaCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Strip Java import and package statements
  code = code.replace(/^\s*import\s+[A-Za-z0-9_.*]+\s*;/gm, "");
  code = code.replace(/^\s*package\s+[A-Za-z0-9_.]+\s*;/gm, "");

  // Mask string literals
  const stringLiterals = [];
  code = code.replace(/"(\\.|[^"\\])*"/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });
  code = code.replace(/'(\\.|[^'\\])*'/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });

  // Extract main method
  let classesCode = code;
  let mainBody = "";

  if (code.includes("// === RUNNER_SECTION_START ===")) {
    const parts = code.split("// === RUNNER_SECTION_START ===");
    classesCode = parts[0];
    const runnerCode = parts[1] || "";
    mainBody = extractMainMethodBodyFromRunner(runnerCode);
  } else {
    // Fallback: extract from combined code
    const extracted = extractMainMethodBody(code);
    mainBody = extracted.mainBody;
    classesCode = extracted.remainingCode;
  }

  let finalMainBody = mainBody;
  code = classesCode;

  // Strip abstract method declarations before doing anything else
  code = code.replace(/(?:public|protected|private)?\s*abstract\s+[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*;/g, "");

  const attributes = parseClassAttributes(code);

  code = code.replace(/\b(public\s+|abstract\s+)*class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+[\w\s,]+)?/g, (match, modifiers, className, parentClass) => {
    let res = `class ${className}`;
    if (parentClass) {
      res += ` extends ${parentClass}`;
    }
    return res;
  });

  code = code.replace(/\bimplements\s+[\w\s,]+/g, "");

  const classRegex = /class\s+(\w+)/g;
  let match;
  const classNames = [];
  while ((match = classRegex.exec(code)) !== null) {
    classNames.push(match[1]);
  }

  classNames.forEach(className => {
    const constrRegex = new RegExp(`\\b(?:public|private|protected|internal)?\\s*${className}\\s*\\(([^)]*)\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{`, 'g');
    code = code.replace(constrRegex, (match, paramStr) => {
      const cleaned = cleanParamTypes(paramStr);
      return `constructor(${cleaned}) {`;
    });
  });

  code = code.replace(/\b(public|private|protected|final|abstract|synchronized|transient|volatile)\b/g, "");

  const types = [
    'int', 'double', 'float', 'boolean', 'char', 'String', 'auto',
    'void', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Object'
  ];
  const allTypes = [...types, ...classNames];

  const varDeclRegex = /\b([A-Z][a-zA-Z0-9_]*|int|double|float|boolean|char|byte|short|long|void)(?:<[a-zA-Z0-9_,\s<>?]*>)?(?:\[\])?\s+([a-zA-Z_][a-zA-Z0-9_]*)\b(?!\s*\()(?=\s*=[^=]|\s*;|\s*,)/g;

  code = code.replace(varDeclRegex, 'let $2');
  finalMainBody = finalMainBody.replace(varDeclRegex, 'let $2');

  allTypes.concat(['void']).forEach(type => {
    const methodRegex = new RegExp(`\\b${type}(?:\\[\\])?\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(([^)]*)\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{`, 'g');
    code = code.replace(methodRegex, (match, methodName, paramStr) => {
      const cleaned = cleanParamTypes(paramStr);
      return `${methodName}(${cleaned}) {`;
    });
  });

  // Strip let declarations of attributes inside class body
  attributes.forEach(attr => {
    const letDeclRegex = new RegExp(`\\blet\\s+${attr}\\s*;`, 'g');
    code = code.replace(letDeclRegex, '');
  });

  // Prepend this. to attributes inside class methods, avoiding constructor/parameter/other declarations
  code = processClassCode(code, attributes);

  // Apply printing and scanner translation to finalMainBody
  finalMainBody = finalMainBody.replace(/System\.out\.println\s*\(([^;]*)\)\s*;/g, 'stdout.push($1); stdout.push("\\n");');
  finalMainBody = finalMainBody.replace(/System\.out\.print\s*\(([^;]*)\)\s*;/g, 'stdout.push($1);');
  finalMainBody = finalMainBody.replace(/System\.out\.printf\s*\(([^;]*)\)\s*;/g, 'stdout.push(sprintf($1));');
  finalMainBody = finalMainBody.replace(/\be\.getMessage\(\)/g, "e.message");
  finalMainBody = finalMainBody.replace(/new\s+Scanner\s*\([^)]*\)/g, "null");
  finalMainBody = finalMainBody.replace(/\b[a-zA-Z0-9_]+\.(?:nextInt|nextDouble|next|nextLine)\(\)/g, "readInput()");

  code = code.replace(/System\.out\.println\s*\(([^;]*)\)\s*;/g, 'stdout.push($1); stdout.push("\\n");');
  code = code.replace(/System\.out\.print\s*\(([^;]*)\)\s*;/g, 'stdout.push($1);');
  code = code.replace(/System\.out\.printf\s*\(([^;]*)\)\s*;/g, 'stdout.push(sprintf($1));');

  code = code.replace(/\be\.getMessage\(\)/g, "e.message");
  code = code.replace(/new\s+Scanner\s*\([^)]*\)/g, "null");
  code = code.replace(/\b[a-zA-Z0-9_]+\.(?:nextInt|nextDouble|next|nextLine)\(\)/g, "readInput()");

  let js = `
    const stdout = [];
    const inputTokens = ${JSON.stringify(inputStr.trim().split(/\s+/).filter(t => t.length > 0))};
    let inputPtr = 0;
    
    const nextInputToken = () => {
      if (inputPtr >= inputTokens.length) return "";
      return inputTokens[inputPtr++];
    };

    const readInput = () => {
      const token = nextInputToken();
      if (!token) return "";
      if (/^-?\\d+(\\.\\d+)?$/.test(token)) {
        return parseFloat(token);
      }
      return token;
    };

    const sprintf = (format, ...args) => {
      let str = format;
      args.forEach(arg => {
        if (str.includes("%.2f")) {
          str = str.replace("%.2f", Number(arg).toFixed(2));
        } else if (str.includes("%.1f")) {
          str = str.replace("%.1f", Number(arg).toFixed(1));
        } else if (str.includes("%s")) {
          str = str.replace("%s", String(arg));
        } else if (str.includes("%d")) {
          str = str.replace("%d", Math.round(Number(arg)));
        } else {
          str = str.replace(/%[a-zA-Z]/, String(arg));
        }
      });
      return str;
    };
  `;

  js += "\n" + code;
  js += `\n// Execute main\n(function() {\n${finalMainBody}\n})();`;
  js += `\nreturn stdout.join("");`;

  // Restore string literals
  stringLiterals.forEach((str, idx) => {
    js = js.replace(new RegExp(`__STR_LITERAL_${idx}__`, 'g'), str);
  });

  return js;
};

// eslint-disable-next-line react-refresh/only-export-components
export const simulateCodeExecution = (code, inputStr = "", language = "cpp") => {
  try {
    const jsCode = translateCppToJs(code, inputStr);
    const result = new Function(jsCode)();
    return {
      output: String(result),
      isError: false
    };
  } catch (err) {
    return {
      output: `Compilation / Execution Error: ${err.message}`,
      isError: true
    };
  }
};

export const translateCppToJsAsync = (cppCode) => {
  validateCppSyntax(cppCode);

  // 1. Clean comments
  let code = cppCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Strip #include and using namespace std;
  code = code.replace(/#include\s*<[^>]+>/g, "");
  code = code.replace(/using\s+namespace\s+std\s*;/g, "");

  // Replace string and character literals with placeholders to make translation safe
  const stringLiterals = [];
  code = code.replace(/"(\\.|[^"\\])*"/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });
  code = code.replace(/'(\\.|[^'\\])*'/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });

  // Remove forward declarations e.g. int test(int a);
  code = code.replace(/^\s*(?:void|int|double|float|bool|string|char)\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*;/gm, "");

  // Helper to translate statements inside function / main bodies
  const translateBlock = (blockCode) => {
    let body = blockCode;
    body = body.replace(/std::cout/g, "cout").replace(/std::cin/g, "cin").replace(/std::endl/g, "endl");

    // Replace cin >> ...
    const cinRegex = /cin\s*(>>\s*[a-zA-Z_][a-zA-Z0-9_]*\s*)+;/g;
    body = body.replace(cinRegex, (match) => {
      const vars = match.split('>>').slice(1).map(v => v.replace(/;$/, '').trim());
      return vars.map(v => `${v} = await readInput();`).join(' ');
    });

    // Replace cout << ...
    const coutRegex = /cout\s*(<<\s*[^;]+)+;/g;
    body = body.replace(coutRegex, (match) => {
      const parts = match.split('<<').slice(1).map(p => p.replace(/;$/, '').trim());
      const pushes = parts.map(part => {
        if (part === 'endl' || part === '"\\n"' || part === "'\\n'") {
          return `onStdout("\\n");`;
        }
        return `onStdout(${part});`;
      });
      return pushes.join(' ');
    });

    // Replace variable declarations: int x = 10; -> let x = 10;
    const typeDeclRegex = /\b(int|double|float|string|bool|char|auto)\s+(\*?\s*[a-zA-Z_]\w*)/g;
    body = body.replace(typeDeclRegex, (match, type, varName) => {
      return `let ${varName.replace(/^\*/, '').trim()}`;
    });

    return body;
  };

  // Find all functions: [returnType, name, params, body]
  let functionsJs = '';
  let mainBody = '';

  const funcHeaderRegex = /(void|int|double|float|bool|string|char)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
  let match;

  const functions = [];
  while ((match = funcHeaderRegex.exec(code)) !== null) {
    const returnType = match[1];
    const funcName = match[2];
    const rawParams = match[3];
    const startIndex = match.index;
    const bodyStartIndex = startIndex + match[0].length;

    // Find matching closing brace
    let depth = 1;
    let endIndex = bodyStartIndex;
    while (depth > 0 && endIndex < code.length) {
      if (code[endIndex] === '{') depth++;
      else if (code[endIndex] === '}') depth--;
      endIndex++;
    }

    const funcBody = code.slice(bodyStartIndex, endIndex - 1);
    functions.push({
      returnType,
      name: funcName,
      rawParams,
      body: funcBody
    });
  }

  functions.forEach(fn => {
    if (fn.name === 'main') {
      let mBody = fn.body.replace(/\breturn\s+0\s*;/g, "");
      mainBody = translateBlock(mBody);
    } else {
      const params = fn.rawParams
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => p.replace(/^(int|double|float|bool|string|char)\s+&?/, '').trim())
        .join(', ');

      const translatedFuncBody = translateBlock(fn.body);
      functionsJs += `
        function ${fn.name}(${params}) {
          ${translatedFuncBody}
        }
      `;
    }
  });

  // Fallback if main wasn't detected by header regex
  if (!mainBody && code.includes('main')) {
    const mainBodyMatch = /int\s+main\s*\(\s*\)\s*\{([\s\S]*)\}/.exec(code);
    if (mainBodyMatch) {
      mainBody = translateBlock(mainBodyMatch[1].replace(/\breturn\s+0\s*;/g, ""));
    }
  }

  let js = `
    const readInput = async () => {
      const token = await onReadInput();
      if (!token) return "";
      if (/^-?\\d+(\\.\\d+)?$/.test(String(token))) {
        return parseFloat(token);
      }
      return token;
    };
    ${functionsJs}
    ${mainBody}
  `;

  // Restore string literals
  stringLiterals.forEach((str, idx) => {
    js = js.replace(new RegExp(`__STR_LITERAL_${idx}__`, 'g'), str);
  });

  return js;
};

export const translateJavaToJsAsync = (javaCode) => {
  let code = javaCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Strip Java import and package statements
  code = code.replace(/^\s*import\s+[A-Za-z0-9_.*]+\s*;/gm, "");
  code = code.replace(/^\s*package\s+[A-Za-z0-9_.]+\s*;/gm, "");

  const stringLiterals = [];
  code = code.replace(/"(\\.|[^"\\])*"/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });
  code = code.replace(/'(\\.|[^'\\])*'/g, (match) => {
    stringLiterals.push(match);
    return `__STR_LITERAL_${stringLiterals.length - 1}__`;
  });

  let classesCode = code;
  let mainBody = "";

  if (code.includes("// === RUNNER_SECTION_START ===")) {
    const parts = code.split("// === RUNNER_SECTION_START ===");
    classesCode = parts[0];
    const runnerCode = parts[1] || "";
    mainBody = extractMainMethodBodyFromRunner(runnerCode);
  } else {
    const extracted = extractMainMethodBody(code);
    mainBody = extracted.mainBody;
    classesCode = extracted.remainingCode;
  }

  let finalMainBody = mainBody;
  code = classesCode;

  code = code.replace(/(?:public|protected|private)?\s*abstract\s+[\w<>[\]]+\s+\w+\s*\([^)]*\)\s*;/g, "");

  const attributes = parseClassAttributes(code);

  code = code.replace(/\b(public\s+|abstract\s+)*class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+[\w\s,]+)?/g, (match, modifiers, className, parentClass) => {
    let res = `class ${className}`;
    if (parentClass) {
      res += ` extends ${parentClass}`;
    }
    return res;
  });

  code = code.replace(/\bimplements\s+[\w\s,]+/g, "");

  const classRegex = /class\s+(\w+)/g;
  let match;
  const classNames = [];
  while ((match = classRegex.exec(code)) !== null) {
    classNames.push(match[1]);
  }

  classNames.forEach(className => {
    const constrRegex = new RegExp(`\\b(?:public|private|protected|internal)?\\s*${className}\\s*\\(([^)]*)\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{`, 'g');
    code = code.replace(constrRegex, (match, paramStr) => {
      const cleaned = cleanParamTypes(paramStr);
      return `constructor(${cleaned}) {`;
    });
  });

  code = code.replace(/\b(public|private|protected|final|abstract|synchronized|transient|volatile)\b/g, "");

  const types = [
    'int', 'double', 'float', 'boolean', 'char', 'String', 'auto',
    'void', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Object',
    'Shape', 'Circle', 'Rectangle', 'Employee', 'Contractor', 'Appliance',
    'WashingMachine', 'Refrigerator', 'Product', 'Payable', 'BankAccount', 'Scanner'
  ];
  const allTypes = [...types, ...classNames];

  const varDeclRegex = /\b([A-Z][a-zA-Z0-9_]*|int|double|float|boolean|char|byte|short|long|void)(?:<[a-zA-Z0-9_,\s<>?]*>)?(?:\[\])?\s+([a-zA-Z_][a-zA-Z0-9_]*)\b(?!\s*\()(?=\s*=[^=]|\s*;|\s*,)/g;

  code = code.replace(varDeclRegex, 'let $2');
  finalMainBody = finalMainBody.replace(varDeclRegex, 'let $2');

  allTypes.concat(['void']).forEach(type => {
    const methodRegex = new RegExp(`\\b${type}(?:\\[\\])?\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(([^)]*)\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{`, 'g');
    code = code.replace(methodRegex, (match, methodName, paramStr) => {
      const cleaned = cleanParamTypes(paramStr);
      return `${methodName}(${cleaned}) {`;
    });
  });

  attributes.forEach(attr => {
    const letDeclRegex = new RegExp(`\\blet\\s+${attr}\\s*;`, 'g');
    code = code.replace(letDeclRegex, '');
  });

  code = processClassCode(code, attributes);

  finalMainBody = finalMainBody.replace(/System\.out\.println\s*\(([^;]*)\)\s*;/g, 'onStdout($1); onStdout("\\n");');
  finalMainBody = finalMainBody.replace(/System\.out\.print\s*\(([^;]*)\)\s*;/g, 'onStdout($1);');
  finalMainBody = finalMainBody.replace(/System\.out\.printf\s*\(([^;]*)\)\s*;/g, 'onStdout(sprintf($1));');
  finalMainBody = finalMainBody.replace(/\be\.getMessage\(\)/g, "e.message");
  finalMainBody = finalMainBody.replace(/new\s+Scanner\s*\([^)]*\)/g, "null");
  finalMainBody = finalMainBody.replace(/\b[a-zA-Z0-9_]+\.(?:nextInt|nextDouble|next|nextLine)\(\)/g, "await readInput()");

  code = code.replace(/System\.out\.println\s*\(([^;]*)\)\s*;/g, 'onStdout($1); onStdout("\\n");');
  code = code.replace(/System\.out\.print\s*\(([^;]*)\)\s*;/g, 'onStdout($1);');
  code = code.replace(/System\.out\.printf\s*\(([^;]*)\)\s*;/g, 'onStdout(sprintf($1));');
  code = code.replace(/\be\.getMessage\(\)/g, "e.message");
  code = code.replace(/new\s+Scanner\s*\([^)]*\)/g, "null");
  code = code.replace(/\b[a-zA-Z0-9_]+\.(?:nextInt|nextDouble|next|nextLine)\(\)/g, "await readInput()");

  let js = `
    const readInput = async () => {
      const token = await onReadInput();
      if (!token) return "";
      if (/^-?\\d+(\\.\\d+)?$/.test(String(token))) {
        return parseFloat(token);
      }
      return token;
    };

    const sprintf = (format, ...args) => {
      let str = format;
      args.forEach(arg => {
        if (str.includes("%.2f")) {
          str = str.replace("%.2f", Number(arg).toFixed(2));
        } else if (str.includes("%.1f")) {
          str = str.replace("%.1f", Number(arg).toFixed(1));
        } else if (str.includes("%s")) {
          str = str.replace("%s", String(arg));
        } else if (str.includes("%d")) {
          str = str.replace("%d", Math.round(Number(arg)));
        } else {
          str = str.replace(/%[a-zA-Z]/, String(arg));
        }
      });
      return str;
    };
  `;

  js += "\n" + code;
  js += `\n// Execute main\nawait (async function() {\n${finalMainBody}\n})();`;

  stringLiterals.forEach((str, idx) => {
    js = js.replace(new RegExp(`__STR_LITERAL_${idx}__`, 'g'), str);
  });

  return js;
};

export const executeCodeAsync = async (code, language, onStdout, onReadInput) => {
  const jsCode = translateCppToJsAsync(code);
  const runnerFn = new Function('onStdout', 'onReadInput', `
    return (async () => {
      \n${jsCode}\n
    })();
  `);
  return runnerFn(onStdout, onReadInput);
};
const normalizeCppCode = (cppCode) => {
  // Strip comments
  let code = cppCode
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Wrap single-statement if/while/for/else without braces in explicit braces
  // e.g. "if (cond) stmt;" -> "if (cond) { stmt; }"
  code = code.replace(/(\b(if|while|for)\s*\([^)]+\))\s*([^{;\s\n][^;\n]+;)/g, '$1 { $3 }');
  code = code.replace(/(\belse\b)\s*([^{;\s\n][^;\n]+;)/g, '$1 { $2 }');

  // Format braces to be on their own lines
  code = code.replace(/\{/g, '\n{\n').replace(/\}/g, '\n}\n');

  // Split statements by semicolon, but not inside for (...) or inside string literals
  let result = "";
  let inParentheses = 0;
  let inString = false;
  let stringChar = null;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];

    // Handle string literal boundaries
    if ((char === '"' || char === "'") && code[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }

    if (!inString) {
      if (char === '(') inParentheses++;
      else if (char === ')') inParentheses--;
    }

    if (char === ';' && inParentheses === 0 && !inString) {
      result += ';\n';
    } else {
      result += char;
    }
  }

  return result
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

const DEFAULT_STARTER = `#include <iostream>
using namespace std;

int main() {
    int x = 10;
    int y = 20;
    int sum = x + y;
    
    cout << "Value of x: " << x << endl;
    cout << "Value of y: " << y << endl;
    cout << "Sum is: " << sum << endl;
    
    return 0;
}`;

export const CppPlaygroundDialog = ({ open, onClose, initialCode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState('compiler'); // 'compiler' | 'flowchart'

  const fileInputRef = useRef(null);

  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.cpp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);
    }
  };
  const [code, setCode] = useState(initialCode || DEFAULT_STARTER);
  const [pseudocode, setPseudocode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('Terminal ready. Click "RUN CODE" to execute.');
  const [isRunning, setIsRunning] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentInputVal, setCurrentInputVal] = useState('');
  const inputResolverRef = useRef(null);
  const terminalInputRef = useRef(null);

  useEffect(() => {
    if (isWaitingForInput && terminalInputRef.current) {
      setTimeout(() => {
        terminalInputRef.current?.focus();
      }, 50);
    }
  }, [isWaitingForInput]);

  // Memory Inspector & Line-by-Line Stepper States
  const [viewMode, setViewMode] = useState('terminal'); // 'terminal' | 'memory' | 'split'
  const [executionSteps, setExecutionSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const decorationsRef = useRef([]);
  const autoPlayIntervalRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    monacoEditorRef.current = editor;
    monacoInstanceRef.current = monaco;
  };

  const updateEditorLineHighlight = (lineNum) => {
    if (!monacoEditorRef.current || !monacoInstanceRef.current) return;
    const monaco = monacoInstanceRef.current;
    if (!lineNum || lineNum <= 0) {
      decorationsRef.current = monacoEditorRef.current.deltaDecorations(decorationsRef.current, []);
      return;
    }

    decorationsRef.current = monacoEditorRef.current.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(lineNum, 1, lineNum, 1),
        options: {
          isWholeLine: true,
          className: 'monaco-executing-line-bg',
          glyphMarginClassName: 'monaco-executing-line-glyph',
          overviewRuler: {
            color: '#3DDC97',
            position: monaco.editor.OverviewRulerLane.Full
          }
        }
      }
    ]);
    monacoEditorRef.current.revealLineInCenter(lineNum);
  };

  const handleStartStepping = () => {
    setIsAutoPlaying(false);
    setIsRunning(false);
    setIsWaitingForInput(false);
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }

    try {
      const steps = traceCppExecution(code);
      if (!steps || steps.length === 0) {
        setExecutionSteps([]);
        setCurrentStepIndex(0);
        updateEditorLineHighlight(null);
        setTerminalOutput('Terminal reset. Ready.\n');
        return;
      }
      setExecutionSteps(steps);
      setCurrentStepIndex(0);
      setViewMode(prev => prev === 'terminal' ? 'memory' : prev);
      updateEditorLineHighlight(steps[0].lineNumber);
      setTerminalOutput(steps[0].stdout !== undefined ? steps[0].stdout : 'Terminal reset. Ready.\n');
    } catch (err) {
      setTerminalOutput(prev => prev + `\n❌ SYNTAX / TRACING ERROR: ${err.message}\n`);
    }
  };

  const handleStepNext = () => {
    if (executionSteps.length === 0) {
      handleStartStepping();
      return;
    }
    if (currentStepIndex < executionSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = executionSteps[nextIdx];
      updateEditorLineHighlight(step.lineNumber);
      if (step.stdout !== undefined) {
        setTerminalOutput(step.stdout || 'Terminal ready.');
      }
    } else {
      setIsAutoPlaying(false);
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const step = executionSteps[prevIdx];
      updateEditorLineHighlight(step.lineNumber);
      if (step.stdout !== undefined) {
        setTerminalOutput(step.stdout || 'Terminal ready.');
      }
    }
  };

  const handleRunAllSteps = () => {
    try {
      const steps = traceCppExecution(code);
      if (steps.length === 0) return;
      setExecutionSteps(steps);
      const lastIdx = steps.length - 1;
      setCurrentStepIndex(lastIdx);
      updateEditorLineHighlight(steps[lastIdx].lineNumber);
      if (steps[lastIdx].stdout !== undefined) {
        setTerminalOutput(steps[lastIdx].stdout || 'Program executed successfully.');
      }
      setIsAutoPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    } else {
      if (executionSteps.length === 0 || currentStepIndex >= executionSteps.length - 1) {
        try {
          const steps = traceCppExecution(code);
          if (steps.length === 0) return;
          setExecutionSteps(steps);
          setCurrentStepIndex(0);
          setViewMode(prev => prev === 'terminal' ? 'memory' : prev);
          updateEditorLineHighlight(steps[0].lineNumber);
        } catch (err) {
          return;
        }
      }
      setIsAutoPlaying(true);
    }
  };

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < executionSteps.length - 1) {
            const nextIdx = prev + 1;
            const step = executionSteps[nextIdx];
            updateEditorLineHighlight(step?.lineNumber);
            if (step?.stdout !== undefined) {
              setTerminalOutput(step.stdout || 'Terminal ready.');
            }
            return nextIdx;
          } else {
            setIsAutoPlaying(false);
            return prev;
          }
        });
      }, 750);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }
    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isAutoPlaying, executionSteps]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(DEFAULT_STARTER);
    }
    setTerminalOutput('Terminal ready. Click "RUN CODE" to execute.');
    setActiveTab('compiler');
    setPseudocode('');
    setExecutionSteps([]);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    updateEditorLineHighlight(0);
  }, [initialCode, open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleRun = async () => {
    setIsRunning(true);
    setTerminalOutput('');
    setIsWaitingForInput(false);
    setCurrentInputVal('');

    let executionTimeoutId = null;
    let rejectExecutionFn = null;

    const resetExecutionTimeout = () => {
      if (executionTimeoutId) clearTimeout(executionTimeoutId);
      executionTimeoutId = setTimeout(() => {
        if (rejectExecutionFn) {
          rejectExecutionFn(new Error("Execution Timed Out (Possible Infinite Loop)"));
        }
      }, 15000);
    };

    try {
      try {
        const steps = traceCppExecution(code);
        setExecutionSteps(steps);
        if (steps.length > 0) {
          setCurrentStepIndex(steps.length - 1);
          updateEditorLineHighlight(steps[steps.length - 1].lineNumber);
        }
      } catch {
        // Fallback gracefully
      }

      const onStdout = (text) => {
        setTerminalOutput(prev => prev + text);
      };

      const onReadInput = () => {
        if (executionTimeoutId) clearTimeout(executionTimeoutId); // Pause timeout while waiting for user!
        return new Promise((resolve) => {
          setIsWaitingForInput(true);
          inputResolverRef.current = (userInput) => {
            resetExecutionTimeout(); // Resume timeout after input is provided
            resolve(userInput);
          };
        });
      };

      const timeoutPromise = new Promise((_, reject) => {
        rejectExecutionFn = reject;
        resetExecutionTimeout();
      });

      await Promise.race([
        executeCodeAsync(code, 'cpp', onStdout, onReadInput),
        timeoutPromise
      ]);

    } catch (err) {
      setTerminalOutput(prev => prev + `\n❌ COMPILATION / RUNTIME ERROR: ${err.message}\n`);
    } finally {
      if (executionTimeoutId) clearTimeout(executionTimeoutId);
      setIsRunning(false);
      setIsWaitingForInput(false);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === 'Enter') {
      const val = currentInputVal;
      setTerminalOutput(prev => prev + val + '\n');
      setCurrentInputVal('');
      setIsWaitingForInput(false);
      if (inputResolverRef.current) {
        inputResolverRef.current(val);
      }
    }
  };

  const handleDownloadPng = async () => {
    try {
      const element = document.getElementById('flowchart-capture-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: theme.palette.mode === 'dark' ? '#0A0C16' : '#FAFAFC',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = 'flowchart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error exporting flowchart to PNG:', err);
      alert('Failed to generate PNG of flowchart: ' + err.message);
    }
  };

  const handleReset = () => {
    if (activeTab === 'compiler') {
      setCode(initialCode || DEFAULT_STARTER);
      setTerminalOutput('Code reset to template.');
    } else {
      setPseudocode(convertCppToPseudocode(code));
    }
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'compiler' ? code : pseudocode;
    navigator.clipboard.writeText(textToCopy);
  };

  const handleGenerateFromCpp = () => {
    setPseudocode(convertCppToPseudocode(code));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="xl"
      PaperProps={{
        elevation: 0,
        style: {
          borderRadius: isMobile ? 0 : '24px',
          background: 'var(--background-paper)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--divider)',
          height: isMobile ? '100dvh' : '90vh',
          minHeight: isMobile ? '100dvh' : '650px',
          overflow: 'hidden'
        }
      }}
    >
      {isMobile ? (
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 24, padding: '32px 24px', textAlign: 'center', background: 'var(--background-default)' }}>
          <Box style={{ fontSize: 64 }}>🖥️</Box>
          <Typography variant="h6" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>Bigger Screen Required</Typography>
          <Typography variant="body2" style={{ color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.7 }}>The C++ Playground is designed for desktop use. Please open it on a larger screen for the full experience.</Typography>
          <Button onClick={onClose} variant="outlined" style={{ borderRadius: 14, borderColor: 'var(--divider)', color: 'var(--text-primary)', textTransform: 'none', fontWeight: 700, marginTop: 8 }}>Close</Button>
        </Box>
      ) : (
        <>
          <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--divider)', flexWrap: 'wrap', gap: '12px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TerminalIcon style={{ color: 'var(--primary-main)' }} />
          <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>
            C++ Compiler Playground
          </Typography>
        </Box>

        {/* Switcher tabs */}
        <Box style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setActiveTab('compiler')}
            style={{
              padding: 'clamp(6px, 0.9vh, 10px) clamp(12px, 1.2vw, 20px)',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'compiler' ? 'var(--primary-main)' : 'transparent',
              color: activeTab === 'compiler' ? '#fff' : 'var(--text-secondary)',
              fontSize: 'clamp(0.8rem, 0.85vw, 0.92rem)',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap'
            }}
          >
            C++ Compiler
          </button>
          <button
            onClick={() => {
              setActiveTab('flowchart');
              setPseudocode(convertCppToPseudocode(code));
            }}
            style={{
              padding: 'clamp(6px, 0.9vh, 10px) clamp(12px, 1.2vw, 20px)',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'flowchart' ? 'var(--primary-main)' : 'transparent',
              color: activeTab === 'flowchart' ? '#fff' : 'var(--text-secondary)',
              fontSize: 'clamp(0.8rem, 0.85vw, 0.92rem)',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Pseudocode & Flowchart Lab
          </button>
        </Box>

        <IconButton onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ padding: '20px 24px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', flexGrow: 1 }}>
        {activeTab === 'compiler' ? (
          <Box style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', flexGrow: 1, minHeight: 0, alignItems: 'stretch', height: '100%' }}>
            {/* Editor Column */}
            <Box style={{ flex: viewMode === 'split' ? 1.12 : 1.2, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, height: '100%', transition: 'flex 0.3s ease' }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', flexWrap: 'wrap', gap: '6px' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Source Code Editor
                  </Typography>
                  {isWaitingForInput ? (
                    <span
                      style={{
                        fontSize: 'clamp(0.65rem, 0.72vw, 0.75rem)',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#F59E0B',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ⌨️ Waiting for Input
                    </span>
                  ) : (isRunning || isAutoPlaying) ? (
                    <span
                      style={{
                        fontSize: 'clamp(0.65rem, 0.72vw, 0.75rem)',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 107, 107, 0.15)',
                        color: '#FF6B6B',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Locked (Running)
                    </span>
                  ) : null}
                </Box>
                <Box style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <IconButton size="small" onClick={handleCopy} title="Copy Code" style={{ color: 'var(--primary-main)', padding: 'clamp(4px, 0.6vh, 8px)' }}>
                    <CopyIcon style={{ fontSize: 'clamp(18px, 1.2vw, 22px)' }} />
                  </IconButton>
                  <IconButton size="small" onClick={handleDownloadFile} title="Download C++ File" style={{ color: 'var(--success-main)', padding: 'clamp(4px, 0.6vh, 8px)' }}>
                    <DownloadIcon style={{ fontSize: 'clamp(18px, 1.2vw, 22px)' }} />
                  </IconButton>
                  <IconButton size="small" disabled={isRunning || isAutoPlaying} onClick={() => fileInputRef.current?.click()} title="Import C++ File" style={{ color: (isRunning || isAutoPlaying) ? 'var(--text-disabled)' : 'var(--orange-500)', padding: 'clamp(4px, 0.6vh, 8px)' }}>
                    <UploadIcon style={{ fontSize: 'clamp(18px, 1.2vw, 22px)' }} />
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    accept=".cpp,.h,.txt"
                    style={{ display: 'none' }}
                  />
                  <IconButton size="small" disabled={isRunning || isAutoPlaying} onClick={handleReset} title="Reset Template" style={{ color: (isRunning || isAutoPlaying) ? 'var(--text-disabled)' : 'var(--text-secondary)', padding: 'clamp(4px, 0.6vh, 8px)' }}>
                    <ResetIcon style={{ fontSize: 'clamp(18px, 1.2vw, 22px)' }} />
                  </IconButton>
                </Box>
              </Box>

              <Box style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fffffe',
                flexGrow: 1,
                width: '100%',
                minHeight: '350px'}}>
                <Editor
                  height="100%"
                  language="cpp"
                  value={code}
                  onChange={(val) => {
                    if (!isRunning && !isAutoPlaying) {
                      setCode(val || '');
                    }
                  }}
                  onMount={handleEditorMount}
                  theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    lineNumbersMinChars: 3,
                    glyphMargin: true,
                    readOnly: isRunning || isAutoPlaying,
                    domReadOnly: isRunning || isAutoPlaying
                  }}
                />
              </Box>
            </Box>

            {/* Console / Terminal & Memory Visualizer Column */}
            <Box style={{ flex: viewMode === 'split' ? 1.7 : 1.1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, height: '100%', transition: 'flex 0.3s ease' }}>
              {/* Output terminal / Memory header with Run & Step buttons */}
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', flexWrap: 'wrap', gap: '8px' }}>
                {/* View Mode Switcher */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  <button
                    onClick={() => setViewMode('terminal')}
                    style={{
                      padding: 'clamp(5px, 0.7vh, 8px) clamp(10px, 0.9vw, 16px)',
                      borderRadius: '7px',
                      border: 'none',
                      background: viewMode === 'terminal' ? 'var(--primary-main)' : 'transparent',
                      color: viewMode === 'terminal' ? '#fff' : 'var(--text-secondary)',
                      fontSize: 'clamp(0.76rem, 0.8vw, 0.88rem)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <TerminalIcon style={{ fontSize: 'clamp(14px, 1vw, 18px)' }} /> Terminal
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('memory');
                      if (executionSteps.length === 0) handleStartStepping();
                    }}
                    style={{
                      padding: 'clamp(5px, 0.7vh, 8px) clamp(10px, 0.9vw, 16px)',
                      borderRadius: '7px',
                      border: 'none',
                      background: viewMode === 'memory' ? 'var(--primary-main)' : 'transparent',
                      color: viewMode === 'memory' ? '#fff' : 'var(--text-secondary)',
                      fontSize: 'clamp(0.76rem, 0.8vw, 0.88rem)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <MemoryIcon style={{ fontSize: 'clamp(14px, 1vw, 18px)' }} /> Memory
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('split');
                      if (executionSteps.length === 0) handleStartStepping();
                    }}
                    title="Split View (Side by Side)"
                    style={{
                      padding: 'clamp(5px, 0.7vh, 8px) clamp(10px, 0.9vw, 16px)',
                      borderRadius: '7px',
                      border: 'none',
                      background: viewMode === 'split' ? 'var(--primary-main)' : 'transparent',
                      color: viewMode === 'split' ? '#fff' : 'var(--text-secondary)',
                      fontSize: 'clamp(0.76rem, 0.8vw, 0.88rem)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <SplitIcon style={{ fontSize: 'clamp(14px, 1vw, 18px)' }} /> Split
                  </button>
                </Box>

                <Box style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0, flexWrap: 'nowrap' }}>
                  {/* Step Count Badge */}
                  <span
                    style={{
                      padding: 'clamp(5px, 0.7vh, 8px) clamp(10px, 0.9vw, 15px)',
                      borderRadius: '7px',
                      background: 'var(--primary-main)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 'clamp(0.76rem, 0.8vw, 0.88rem)',
                      fontFamily: '"Roboto Mono", monospace',
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {executionSteps.length > 0 ? `${currentStepIndex + 1}/${executionSteps.length}` : '1/1'}
                  </span>

                  {/* Step Control Buttons (Prev, Auto, Next, Reset) */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '2px 4px' }}>
                    <Tooltip title="Previous Line">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleStepPrev}
                          disabled={currentStepIndex <= 0 || executionSteps.length === 0}
                          style={{ color: currentStepIndex > 0 ? 'var(--text-primary)' : 'var(--text-disabled)', padding: 'clamp(4px, 0.6vh, 7px)' }}
                        >
                          <StepPrevIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title={isAutoPlaying ? "Pause Auto-Run" : "Auto-Run (Line by Line)"}>
                      <IconButton
                        size="small"
                        onClick={handleToggleAutoPlay}
                        style={{
                          padding: 'clamp(4px, 0.6vh, 7px)',
                          color: isAutoPlaying ? '#FF6B6B' : '#38BDF8',
                          background: isAutoPlaying ? 'rgba(255, 107, 107, 0.12)' : 'rgba(56, 189, 248, 0.12)'
                        }}
                      >
                        {isAutoPlaying ? <PauseIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} /> : <PlayIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Next Line">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleStepNext}
                          disabled={executionSteps.length > 0 && currentStepIndex >= executionSteps.length - 1}
                          style={{ color: (executionSteps.length === 0 || currentStepIndex < executionSteps.length - 1) ? 'var(--text-primary)' : 'var(--text-disabled)', padding: 'clamp(4px, 0.6vh, 7px)' }}
                        >
                          <StepNextIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Restart to Line 1">
                      <IconButton size="small" onClick={handleStartStepping} style={{ color: 'var(--text-secondary)', padding: 'clamp(4px, 0.6vh, 7px)' }}>
                        <ResetIcon style={{ fontSize: 'clamp(17px, 1.1vw, 21px)' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Button
                    variant="contained"
                    disabled={isRunning}
                    onClick={handleRun}
                    startIcon={<PlayIcon style={{ fontSize: 'clamp(16px, 1.1vw, 20px)' }} />}
                    size="small"
                    style={{
                      padding: 'clamp(6px, 0.8vh, 10px) clamp(14px, 1.3vw, 22px)',
                      borderRadius: '8px',
                      fontWeight: 800,
                      textTransform: 'none',
                      background: 'var(--hero-gradient)',
                      color: '#fff',
                      fontSize: 'clamp(0.78rem, 0.85vw, 0.92rem)',
                      boxShadow: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isRunning ? "RUNNING..." : "RUN ALL"}
                  </Button>
                </Box>
              </Box>
              
              {/* Content Panel based on viewMode */}
              {viewMode === 'memory' ? (
                <Paper
                  elevation={0}
                  style={{
                    flexGrow: 1,
                    padding: '12px',
                    backgroundColor: '#0c0d12',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflowY: 'auto',
                    height: '100%',
                    minHeight: '350px'
                  }}
                >
                  <CppMemoryInspectorView
                    currentStep={currentStepIndex}
                    totalSteps={executionSteps.length || 1}
                    stepData={executionSteps[currentStepIndex]}
                    onStepNext={handleStepNext}
                    onStepPrev={handleStepPrev}
                    onRunAll={handleRunAllSteps}
                    onReset={handleStartStepping}
                    isAutoPlaying={isAutoPlaying}
                    onToggleAutoPlay={handleToggleAutoPlay}
                  />
                </Paper>
              ) : viewMode === 'split' ? (
                <Box style={{ flexGrow: 1, display: 'flex', flexDirection: 'row', gap: '14px', height: '100%', minHeight: 0, alignItems: 'stretch' }}>
                  {/* Column 1: Memory Inspector View */}
                  <Paper
                    elevation={0}
                    style={{
                      flex: 1.15,
                      padding: '12px',
                      backgroundColor: '#0c0d12',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflowY: 'auto',
                      height: '100%',
                      minHeight: 0
                    }}
                  >
                    <CppMemoryInspectorView
                      currentStep={currentStepIndex}
                      totalSteps={executionSteps.length || 1}
                      stepData={executionSteps[currentStepIndex]}
                      onStepNext={handleStepNext}
                      onStepPrev={handleStepPrev}
                      onRunAll={handleRunAllSteps}
                      onReset={handleStartStepping}
                      isAutoPlaying={isAutoPlaying}
                      onToggleAutoPlay={handleToggleAutoPlay}
                    />
                  </Paper>

                  {/* Column 2: Terminal Output View */}
                  <Paper
                    elevation={0}
                    style={{
                      flex: 0.85,
                      padding: '14px',
                      backgroundColor: '#0c0d12',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: '0.8rem',
                      color: '#3DDC97',
                      whiteSpace: 'pre-wrap',
                      overflowY: 'auto',
                      height: '100%',
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <TerminalIcon style={{ fontSize: '15px', color: 'var(--text-secondary)' }} />
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Interactive Output
                      </Typography>
                    </Box>

                    <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                      {terminalOutput}
                      {isWaitingForInput && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', background: 'rgba(245, 158, 11, 0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                          <span style={{ color: '#FF9F43', fontWeight: 800 }}>{`> `}</span>
                          <input
                            ref={terminalInputRef}
                            type="text"
                            value={currentInputVal}
                            onChange={(e) => setCurrentInputVal(e.target.value)}
                            onKeyDown={handleInputSubmit}
                            autoFocus
                            placeholder="Type input and press Enter..."
                            style={{
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: '#3DDC97',
                              fontFamily: '"Roboto Mono", monospace',
                              fontSize: '0.8rem',
                              flexGrow: 1,
                              caretColor: '#3DDC97'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Paper>
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  style={{
                    flexGrow: 1,
                    padding: '16px',
                    backgroundColor: '#0c0d12',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.82rem',
                    color: '#3DDC97',
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto',
                    height: '100%',
                    minHeight: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                  }}
                >
                  <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {terminalOutput}
                    {isWaitingForInput && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', background: 'rgba(245, 158, 11, 0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                        <span style={{ color: '#FF9F43', fontWeight: 800 }}>{`> `}</span>
                        <input
                          ref={terminalInputRef}
                          type="text"
                          value={currentInputVal}
                          onChange={(e) => setCurrentInputVal(e.target.value)}
                          onKeyDown={handleInputSubmit}
                          autoFocus
                          placeholder="Type input and press Enter..."
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#3DDC97',
                            fontFamily: '"Roboto Mono", monospace',
                            fontSize: '0.82rem',
                            flexGrow: 1,
                            caretColor: '#3DDC97'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Paper>
              )}
            </Box>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', flexGrow: 1, minHeight: 0, alignItems: 'stretch', height: '100%' }}>
            {/* Pseudocode Editor Panel */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '36px' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pseudocode Editor
                </Typography>
                <Box style={{ display: 'flex', gap: '4px' }}>
                  <IconButton size="small" onClick={handleCopy} title="Copy Pseudocode" style={{ color: 'var(--primary-main)' }}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleReset} title="Reset to C++ Output" style={{ color: 'var(--text-secondary)' }}>
                    <ResetIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <TextField
                multiline
                fullWidth
                value={pseudocode}
                onChange={(e) => setPseudocode(e.target.value)}
                variant="outlined"
                style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                InputProps={{
                  style: {
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: theme.palette.mode === 'dark' ? '#E5E9F0' : '#2D2D4D',
                    backgroundColor: theme.palette.mode === 'dark' ? '#0F1424' : '#F7F9FC',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid var(--code-border)',
                    flexGrow: 1,
                    alignItems: 'flex-start'
                  }
                }}
                sx={{
                  height: '100%',
                  '& .MuiOutlinedInput-root': { padding: 0, height: '100%', '& fieldset': { border: 'none' } }
                }}
              />
            </Box>

            {/* Visual Flowchart Display Panel */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minWidth: 0 }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', flexWrap: 'wrap', gap: '6px' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                  Flowchart Visualizer
                </Typography>
                <Box style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'nowrap' }}>
                  <Button
                    variant="outlined"
                    onClick={handleDownloadPng}
                    startIcon={<DownloadIcon style={{ fontSize: 'clamp(15px, 1.1vw, 19px)' }} />}
                    size="small"
                    style={{
                      padding: 'clamp(5px, 0.7vh, 9px) clamp(12px, 1.1vw, 18px)',
                      borderRadius: '8px',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderColor: 'var(--primary-main)',
                      color: 'var(--primary-main)',
                      fontSize: 'clamp(0.76rem, 0.8vw, 0.88rem)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Download PNG
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateFromCpp}
                    startIcon={<ResetIcon style={{ fontSize: 'clamp(15px, 1.1vw, 19px)' }} />}
                    size="small"
                    style={{
                      padding: 'clamp(5px, 0.7vh, 9px) clamp(12px, 1.1vw, 18px)',
                      borderRadius: '8px',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderColor: 'var(--primary-main)',
                      color: 'var(--primary-main)',
                      fontSize: 'clamp(0.76rem, 0.8vw, 0.88rem)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Sync C++
                  </Button>
                </Box>
              </Box>
              <CppFlowchartRenderer pseudocodeText={pseudocode} onDownloadPng={handleDownloadPng} />
            </Box>
          </Box>
        )}
        </DialogContent>
        </>
      )}
    </Dialog>
  );
};
