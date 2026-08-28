import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { CppPlaygroundDialog } from '../components/CppPlaygroundDialog';
import { UmlDiagram } from '../components/course/UmlDiagram';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  LinearProgress,
  IconButton,
  useTheme,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Modal,
  Fade,
  Backdrop,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  MenuBook as BookIcon,
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  PlayArrow as PlayArrowIcon,
  HelpOutline as HelpOutlineIcon,
  Terminal as TerminalIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as TrophyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { coursesData } from '../data/courses';
import './LearningContentPage.css';
import logoImg from '../assets/sp-logo.png';
import {
  SocraticDialogueWidget,
  FallacySorterWidget,
  ShipOfTheseusWidget,
  TrolleyProblemWidget,
  PlatosCaveWidget
} from './PhilosophyLabPage';

import DenialOfServiceLab from './labs/DenialOfServiceLab';
import DistributedDenialOfServiceLab from './labs/DistributedDenialOfServiceLab';
import RansomwareLab from './labs/RansomwareLab';
import SocialEngineeringLab from './labs/SocialEngineeringLab';
import InsiderThreatLab from './labs/InsiderThreatLab';
import VulnerabilityChallengeWidget from '../components/course/VulnerabilityChallengeWidget';

const parseFormattedText = (text, allowNewlines = false) => {
  if (!text) return '';
  if (typeof text !== 'string') return text;
  
  const parts = text.split(/(<code>[\s\S]*?<\/code>|<b>[\s\S]*?<\/b>|\\n)/g);
  
  return parts.map((part, index) => {
    if (!part) return null;
    if (part === '\\n') {
      return allowNewlines ? <br key={index} /> : null;
    }
    if (part.startsWith('<code>') && part.endsWith('</code>')) {
      const codeContent = part.substring(6, part.length - 7);
      return (
        <code key={index} className="slide-inline-code">
          {codeContent}
        </code>
      );
    }
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      const bContent = part.substring(3, part.length - 4);
      return (
        <b key={index}>{bContent}</b>
      );
    }
    return part;
  });
};

const highlightCppCode = (code, isDarkMode) => {
  if (!code) return '';
  
  const pattern = /(\/\/.*$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#(?:include|define|pragma|ifdef|endif)\b|\b(?:using|namespace|int|return|void|double|float|char|string|bool|if|else|for|while|class|struct|public|private|true|false|const|auto|long|short|switch|case|break|continue|new|delete|std|cout|cin|endl|main)\b|[{}()[\];,<>+\-*/=])/g;

  const keywords = new Set([
    'using', 'namespace', 'int', 'return', 'void', 'double', 'float', 'char', 'string',
    'bool', 'if', 'else', 'for', 'while', 'class', 'struct', 'public', 'private',
    'true', 'false', 'const', 'auto', 'long', 'short', 'switch', 'case', 'break',
    'continue', 'new', 'delete'
  ]);

  const libraryWords = new Set(['cout', 'cin', 'std', 'endl', 'main']);

  const parts = code.split(pattern);

  return parts.map((part, idx) => {
    if (part === undefined || part === null) return null;
    
    let color = isDarkMode ? '#D4D4D4' : '#333333';
    let fontWeight = '400';

    if (part.startsWith('//') || part.startsWith('/*')) {
      color = isDarkMode ? '#6A9955' : '#008000';
    } else if (part.startsWith('"') || part.startsWith("'")) {
      color = isDarkMode ? '#CE9178' : '#A31515';
    } else if (part.startsWith('#') || keywords.has(part)) {
      color = isDarkMode ? '#569CD6' : '#0000FF';
      fontWeight = '600';
    } else if (libraryWords.has(part)) {
      color = isDarkMode ? '#DCDCAA' : '#795E26';
    } else if (/^\d+(?:\.\d+)?$/.test(part)) {
      color = isDarkMode ? '#B5CEA8' : '#098658';
    }

    return (
      <span key={idx} style={{ color, fontWeight }}>
        {part}
      </span>
    );
  });
};

const translateCppToJs = (cppCode, inputStr) => {
  let code = cppCode
    .replace(/\/\/.*$/gm, "") 
    .replace(/\/\*[\s\S]*?\*\//g, ""); 

  const mainBodyMatch = /int\s+main\s*\(\s*\)\s*\{([\s\S]*)\}/.exec(code);
  if (!mainBodyMatch) {
    throw new Error("Missing int main() structure.");
  }
  let body = mainBodyMatch[1].trim();
  body = body.replace(/\breturn\s+0\s*;/g, "");

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

  // Array replacements first before type keyword translation
  body = body.replace(/\b(int|double|float|string|bool|char|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]+)\}\s*;/g, 'let $2 = [$3];');
  body = body.replace(/\b(int|double|float|string|bool|char|auto)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\[\s*([^\]]+)\s*\]\s*;/g, 'let $2 = new Array($3).fill(0);');

  // Range-based loops: for (Type val : collection) -> for (let val of collection)
  body = body.replace(/for\s*\(\s*(int|double|float|string|bool|char|auto)\s+([a-zA-Z0-9_$]+)\s*:\s*([^)]+)\)/g, 'for (let $2 of $3)');

  // Type casts: (double)(val) -> Number(val)
  body = body.replace(/\((double|float)\)\s*\(([^)]+)\)/g, 'Number($2)');
  body = body.replace(/\((double|float)\)\s*([a-zA-Z0-9_$.]+(?:\([^)]*\))?)/g, 'Number($2)');
  body = body.replace(/\(int\)\s*\(([^)]+)\)/g, 'Math.trunc($1)');
  body = body.replace(/\(int\)\s*([a-zA-Z0-9_$.]+(?:\([^)]*\))?)/g, 'Math.trunc($1)');

  body = body.replace(/std::cout/g, "cout").replace(/std::cin/g, "cin").replace(/std::endl/g, "endl");
  body = body.replace(/\.length\s*\(\s*\)/g, ".length").replace(/\.size\s*\(\s*\)/g, ".length");

  const types = ['int', 'double', 'float', 'string', 'bool', 'char', 'auto'];
  types.forEach(type => {
    const regex = new RegExp(`\\b${type}\\b`, 'g');
    body = body.replace(regex, 'let');
  });

  const cinRegex = /cin\s*(>>\s*[a-zA-Z_][a-zA-Z0-9_]*\s*)+;/g;
  body = body.replace(cinRegex, (match) => {
    const vars = match.split('>>').slice(1).map(v => v.replace(/;$/, '').trim());
    return vars.map(v => `${v} = readInput();`).join(' ');
  });

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

  js += "\n" + body;
  js += `\nreturn stdout.join("");`;
  return js;
};

const translateJavaToJs = (javaCode, inputStr) => {
  let code = javaCode
    .replace(/\/\/.*$/gm, "") 
    .replace(/\/\*[\s\S]*?\*\//g, ""); 

  // Strip Java annotations (e.g. @Override, @Deprecated, etc.)
  code = code.replace(/@\w+\b/g, "");

  code = code.replace(/import\s+[\w.]+;/g, "");
  code = code.replace(/\bextends\s+Exception\b/g, "extends Error");
  
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
    code = code.replace(constrRegex, 'constructor($1) {');
  });

  code = code.replace(/\b(public|private|protected|final|abstract|synchronized|transient|volatile)\b/g, "");

  const types = ['int', 'double', 'float', 'boolean', 'char', 'String', 'auto', 'Shape', 'Circle', 'Rectangle', 'Employee', 'Contractor', 'Appliance', 'WashingMachine', 'Refrigerator', 'Product', 'Payable', 'BankAccount', 'Scanner'];
  types.forEach(type => {
    const varDeclRegex = new RegExp(`\\b${type}(?:\\[\\])?\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\b`, 'g');
    code = code.replace(varDeclRegex, 'let $1');
  });

  types.concat(['void']).forEach(type => {
    const methodRegex = new RegExp(`\\b${type}(?:\\[\\])?\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(([^)]*)\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{`, 'g');
    code = code.replace(methodRegex, '$1($2) {');
  });

  code = code.replace(/\(([^)]*)\)/g, (match, paramStr) => {
    if (!paramStr.trim()) return "()";
    if (paramStr.includes('args') && (paramStr.includes('String') || paramStr.includes('[]'))) {
      return "(args)";
    }
    const params = paramStr.split(',').map(p => {
      const parts = p.trim().split(/\s+/);
      return parts[parts.length - 1];
    });
    return `(${params.join(', ')})`;
  });

  // Catch clauses replacement
  code = code.replace(/catch\s*\(\s*[A-Za-z0-9_$<>[\]]+\s+([A-Za-z0-9_$]+)\s*\)/g, 'catch ($1)');

  // Generic syntax instantiation replacement (e.g. new ArrayList<String>(), new HashMap<K,V>())
  code = code.replace(/new\s+([A-Za-z0-9_]+)\s*<[^>]*>\s*\(\)/g, 'new $1()');


  // Division by zero check
  code = code.replace(/\/\s*0\b/g, '; throw new Error("ArithmeticException: / by zero")');

  // Array replacements
  const replaceArrays = (c) => {
    c = c.replace(/new\s+[A-Za-z0-9_]+\s*\[\]\s*\{([^}]+)\}/g, '[$1]');
    c = c.replace(/=\s*\{([^}]+)\}/g, '= [$1]');
    c = c.replace(/new\s+(int|double|float|byte|short|long)\s*\[([^\]]+)\]/g, 'new Array($2).fill(0)');
    c = c.replace(/new\s+(boolean)\s*\[([^\]]+)\]/g, 'new Array($2).fill(false)');
    c = c.replace(/new\s+(char)\s*\[([^\]]+)\]/g, 'new Array($2).fill("\\\0")');
    c = c.replace(/new\s+([A-Za-z0-9_]+)\s*\[([^\]]+)\]/g, 'new Array($2).fill(null)');
    return c;
  };
  code = replaceArrays(code);

  // Enhanced for loop and type cast replacements
  const replaceAdvancedSyntax = (c) => {
    // 1. Enhanced for loop: for (Type val : collection) -> for (let val of collection)
    c = c.replace(/for\s*\(\s*([A-Za-z0-9_$<>[\]]+)\s+([A-Za-z0-9_$]+)\s*:\s*([^)]+)\)/g, 'for (let $2 of $3)');
    
    // 2. Numeric casts: (int)(value) or (int) value
    c = c.replace(/\(int\)\s*\(([^)]+)\)/g, 'Math.trunc($1)');
    c = c.replace(/\(int\)\s*([A-Za-z0-9_$.]+(?:\([^)]*\))?)/g, 'Math.trunc($1)');
    
    c = c.replace(/\((?:double|float)\)\s*\(([^)]+)\)/g, 'Number($1)');
    c = c.replace(/\((?:double|float)\)\s*([A-Za-z0-9_$.]+(?:\([^)]*\))?)/g, 'Number($1)');
    
    // 3. String .length() and list .size() -> .length
    c = c.replace(/\.length\s*\(\s*\)/g, '.length');
    c = c.replace(/\.size\s*\(\s*\)/g, '.length');
    return c;
  };
  code = replaceAdvancedSyntax(code);

  code = code.replace(/System\.out\.println\s*\(([^;]*)\)\s*;/g, 'printHelper($1); printHelper("\\n");');
  code = code.replace(/System\.out\.print\s*\(([^;]*)\)\s*;/g, 'printHelper($1);');
  code = code.replace(/System\.out\.printf\s*\(([^;]*)\)\s*;/g, 'printHelper(sprintf($1));');

  code = code.replace(/\be\.getMessage\(\)/g, "e.message");
  code = code.replace(/\b[a-zA-Z0-9_]+\.close\s*\(\s*\)\s*;?/g, "");
  code = code.replace(/new\s+Scanner\s*\([^)]*\)/g, "null");
  code = code.replace(/\b[a-zA-Z0-9_]+\.(?:nextInt|nextDouble|next|nextLine)\(\)/g, "readInput()");

  const mainRegex = /main\s*\(([^)]*)\)\s*\{([\s\S]*)\}/;
  const mainMatch = mainRegex.exec(code);
  let mainBody = "";
  if (mainMatch) {
    mainBody = mainMatch[2].trim();
    code = code.replace(mainRegex, "");
  }

  let js = `
    class ArrayList extends Array {
      add(element) {
        this.push(element);
        return true;
      }
      remove(indexOrElement) {
        if (typeof indexOrElement === 'number') {
          this.splice(indexOrElement, 1);
        } else {
          const idx = this.indexOf(indexOrElement);
          if (idx !== -1) this.splice(idx, 1);
        }
      }
      get(index) {
        return this[index];
      }
      set(index, element) {
        const old = this[index];
        this[index] = element;
        return old;
      }
      size() {
        return this.length;
      }
      clear() {
        this.length = 0;
      }
      isEmpty() {
        return this.length === 0;
      }
      contains(element) {
        return this.includes(element);
      }
    }

    class HashMap extends Map {
      put(key, value) {
        const old = this.get(key);
        this.set(key, value);
        return old === undefined ? null : old;
      }
      remove(key) {
        const old = this.get(key);
        this.delete(key);
        return old === undefined ? null : old;
      }
      containsKey(key) {
        return this.has(key);
      }
      containsValue(value) {
        for (let v of this.values()) {
          if (v === value || (v && typeof v.equals === 'function' && v.equals(value))) {
            return true;
          }
        }
        return false;
      }
      size() {
        return this.size;
      }
      isEmpty() {
        return this.size === 0;
      }
    }

    class HashSet extends Set {
      add(element) {
        const had = this.has(element);
        super.add(element);
        return !had;
      }
      remove(element) {
        return this.delete(element);
      }
      contains(element) {
        return this.has(element);
      }
      size() {
        return this.size;
      }
      isEmpty() {
        return this.size === 0;
      }
    }

    if (!Object.prototype.equals) {
      Object.defineProperty(Object.prototype, 'equals', {
        value: function(other) {
          if (other === null || other === undefined) return false;
          if (this === other) return true;
          if (typeof this.valueOf === 'function' && typeof other.valueOf === 'function') {
            return this.valueOf() === other.valueOf();
          }
          return this === other;
        },
        writable: true,
        configurable: true,
        enumerable: false
      });
    }
    if (!Object.prototype.equalsTo) {
      Object.defineProperty(Object.prototype, 'equalsTo', {
        value: Object.prototype.equals,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }


    const stdout = [];
    const printHelper = (val) => {
      if (val === undefined) return;
      stdout.push(val === null ? "null" : val);
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
  js += `\n// Execute main\n(function() {\n${mainBody}\n})();`;
  js += `\nreturn stdout.join("");`;
  return js;
};

const simulateCodeExecution = (code, inputStr = "", language = "cpp") => {
  try {
    const isJava = language.toLowerCase() === 'java' || code.includes('class ') || code.includes('System.out');
    const jsCode = isJava ? translateJavaToJs(code, inputStr) : translateCppToJs(code, inputStr);
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

const groupIntoVisualLines = (flatLines) => {
  if (!flatLines) return [];
  const rows = [];
  let index = 0;

  while (index < flatLines.length) {
    const current = flatLines[index];

    if (
      current.type === 'code' &&
      index + 1 < flatLines.length &&
      flatLines[index + 1].type === 'input'
    ) {
      const row = [current];
      index++;
      
      while (index < flatLines.length && flatLines[index].type === 'input') {
        row.push(flatLines[index]);
        index++;
      }
      
      if (index < flatLines.length) {
        const possibleContinuation = flatLines[index];
        if (
          possibleContinuation.type === 'code' &&
          possibleContinuation.content.startsWith(' ') &&
          possibleContinuation.content.trim().length > 0
        ) {
          row.push(possibleContinuation);
          index++;
        }
      }
      
      rows.push(row);
      continue;
    }

    rows.push([current]);
    index++;
  }

  return rows;
};

const getCompletedCode = (question, values = null) => {
  const visualLines = groupIntoVisualLines(question.codeTemplateLines || question.codeTemplate?.lines);
  let inputIdx = 0;
  
  return visualLines.map(lineGroup => {
    return lineGroup.map(part => {
      if (part.type === 'input') {
        if (values === null) {
          return part.expectedAnswer || '';
        }
        const val = values[inputIdx] !== undefined ? values[inputIdx] : '';
        inputIdx++;
        return val;
      }
      return part.content || part.content === '' ? part.content : '';
    }).join('');
  }).join('\n');
};

const getIndentation = (visualLines, lineIdx) => {
  for (let i = lineIdx - 1; i >= 0; i--) {
    const prevLine = visualLines[i];
    if (prevLine && prevLine.length > 0 && prevLine[0].type === 'code') {
      const content = prevLine[0].content || '';
      const match = content.match(/^(\s+)/);
      if (match) {
        return match[1];
      }
    }
  }
  for (let i = lineIdx + 1; i < visualLines.length; i++) {
    const nextLine = visualLines[i];
    if (nextLine && nextLine.length > 0 && nextLine[0].type === 'code') {
      const content = nextLine[0].content || '';
      const match = content.match(/^(\s+)/);
      if (match) {
        return match[1];
      }
    }
  }
  return '';
};

const _blockKey = (pageIdx, blockIdx) => `${pageIdx}_${blockIdx}`;

const InlineMcqWidget = ({
  question,
  answers,
  correctAnswerIndex,
  codeSnippet,
  initiallyAnswered,
  initialSelectedIndex,
  onAnswered,
  isDarkMode
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex !== undefined ? initialSelectedIndex : null);
  const [answered, setAnswered] = useState(initiallyAnswered);

  useEffect(() => {
    setAnswered(initiallyAnswered);
    if (initialSelectedIndex !== undefined) {
      setSelectedIndex(initialSelectedIndex);
    } else {
      setSelectedIndex(null);
    }
  }, [initiallyAnswered, initialSelectedIndex]);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelectedIndex(idx);
    setAnswered(true);
    const isCorrect = idx === correctAnswerIndex;
    onAnswered(idx, isCorrect);
  };

  const isCorrect = selectedIndex === correctAnswerIndex;

  return (
    <Box className="inline-mcq-container glass-panel-strong" style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <HelpOutlineIcon style={{ color: 'var(--primary-main)' }} />
        <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Choose the Right Answer
        </Typography>
      </Box>
      <Typography variant="body1" style={{ fontWeight: 650, marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {parseFormattedText(question)}
      </Typography>

      {codeSnippet && codeSnippet.lines && codeSnippet.lines.length > 0 && (
        <Paper className="slide-code-card" elevation={0} style={{ marginBottom: '18px', background: 'rgba(0,0,0,0.2)' }}>
          <div className="code-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span>{codeSnippet.language?.toUpperCase() || 'CODE'}</span>
          </div>
          <div className="code-card-body" style={{ padding: '12px' }}>
            <pre className="code-pre" style={{ margin: 0 }}>
              {codeSnippet.lines.map((line, lIdx) => (
                <div key={lIdx} className="code-line" style={{ display: 'flex' }}>
                  <span className="code-line-number" style={{ width: '25px', opacity: 0.4 }}>{lIdx + 1}</span>
                  <span className="code-line-content">{highlightCppCode(line, isDarkMode)}</span>
                </div>
              ))}
            </pre>
          </div>
        </Paper>
      )}

      <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {answers.map((ans, i) => {
          const answerText = typeof ans === 'object' ? ans.answer : ans;
          const isSelected = i === selectedIndex;
          const isCorrectAnswer = i === correctAnswerIndex;

          let btnBg = 'rgba(255,255,255,0.03)';
          let btnBorder = '1px solid rgba(255,255,255,0.06)';
          let btnColor = 'var(--text-primary)';

          if (answered) {
            if (isSelected) {
              btnBg = isCorrect ? 'rgba(76, 175, 80, 0.12)' : 'rgba(239, 83, 80, 0.12)';
              btnBorder = isCorrect ? '1.5px solid #4CAF50' : '1.5px solid #ef5350';
            } else if (isCorrectAnswer) {
              btnBg = 'rgba(76, 175, 80, 0.06)';
              btnBorder = '1.5px dashed rgba(76, 175, 80, 0.5)';
            }
          } else {
            if (isSelected) {
              btnBorder = '1.5px solid var(--primary-main)';
            }
          }

          return (
            <Button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '14px 18px',
                background: btnBg,
                border: btnBorder,
                borderRadius: '12px',
                color: btnColor,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                width: '100%',
                fontWeight: isSelected ? 700 : 400
              }}
            >
              <span style={{ flexGrow: 1, fontSize: '0.92rem' }}>{parseFormattedText(answerText)}</span>
              {answered && isSelected && (
                isCorrect ? <SuccessIcon style={{ color: '#4CAF50' }} /> : <CancelIcon style={{ color: '#ef5350' }} />
              )}
              {answered && !isSelected && isCorrectAnswer && (
                <SuccessIcon style={{ color: '#4CAF50', opacity: 0.6 }} />
              )}
            </Button>
          );
        })}
      </Box>

      {answered && (
        <Box style={{
          marginTop: '18px',
          padding: '14px 16px',
          borderRadius: '12px',
          backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.08)' : 'rgba(239, 83, 80, 0.08)',
          border: `1px solid ${isCorrect ? 'rgba(76, 175, 80, 0.15)' : 'rgba(239, 83, 80, 0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {isCorrect ? (
            <SuccessIcon style={{ color: '#4CAF50', fontSize: '20px' }} />
          ) : (
            <ErrorIcon style={{ color: '#ef5350', fontSize: '20px' }} />
          )}
          <Typography variant="body2" style={{ color: isCorrect ? '#4CAF50' : '#ef5350', fontWeight: 700 }}>
            {isCorrect ? 'Correct! Well done.' : 'Incorrect. Review the correct option highlighted above.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const InlineCodeExerciseWidget = ({
  blockType,
  instruction,
  fileName,
  codeLines,
  language,
  initiallyAnswered,
  initialInputValues,
  onAnswered,
  isDarkMode
}) => {
  const [answered, setAnswered] = useState(initiallyAnswered);
  const [inputValues, setInputValues] = useState(initialInputValues || {});
  const [statuses, setStatuses] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setAnswered(initiallyAnswered);
    if (initialInputValues) {
      setInputValues(initialInputValues);
    }
  }, [initiallyAnswered, initialInputValues]);

  const visualRows = [];
  let i = 0;
  while (i < codeLines.length) {
    const line = codeLines[i];
    if (line.sameLine && visualRows.length > 0) {
      visualRows[visualRows.length - 1].push({ line, idx: i });
    } else {
      visualRows.push([{ line, idx: i }]);
    }
    i++;
  }

  const handleInputChange = (idx, value) => {
    if (answered) return;
    setValidationError('');
    setInputValues(prev => ({
      ...prev,
      [idx]: value
    }));
  };

  const handleCheck = async () => {
    if (isChecking) return;

    // Check if any blank is empty or only whitespace
    const hasEmptyField = codeLines.some((line, idx) => {
      if (line.type === 'input') {
        const val = inputValues[idx];
        return !val || val.trim() === '';
      }
      return false;
    });

    if (hasEmptyField) {
      setValidationError('Please fill in all blanks before checking.');
      return;
    }

    setIsChecking(true);
    setFeedbackMessage('');

    if (blockType === 'write_line') {
      let fullCode = '';
      codeLines.forEach((line, idx) => {
        if (line.type === 'input') {
          fullCode += (inputValues[idx] || '') + '\n';
        } else {
          fullCode += (line.content || '') + '\n';
        }
      });

      if (!fullCode.trim()) {
        setFeedbackMessage('Please enter some code.');
        setIsChecking(false);
        return;
      }

      const res = simulateCodeExecution(fullCode, '', language);
      const passed = !res.isError;
      setLastAnswerCorrect(passed);
      setAnswered(true);
      if (passed) {
        setFeedbackMessage('Correct! Your code executed successfully.');
      } else {
        setFeedbackMessage(`Execution error: ${res.output}`);
      }
      onAnswered(passed);
    } else {
      let allCorrect = true;
      const newStatuses = {};
      codeLines.forEach((line, idx) => {
        if (line.type === 'input') {
          const expected = (line.expectedAnswer || '').trim().toLowerCase();
          const actual = (inputValues[idx] || '').trim().toLowerCase();
          
          const normExpected = expected.replace(/\s+/g, '').replace(/;+$/, '');
          const normActual = actual.replace(/\s+/g, '').replace(/;+$/, '');

          if (normActual === normExpected) {
            newStatuses[idx] = 'correct';
          } else {
            newStatuses[idx] = 'incorrect';
            allCorrect = false;
          }
        }
      });

      setStatuses(newStatuses);
      setLastAnswerCorrect(allCorrect);
      setAnswered(true);
      setFeedbackMessage(allCorrect ? 'Correct! Well done.' : 'Incorrect. Review your answers and try again.');
      onAnswered(allCorrect);
    }
    setIsChecking(false);
  };

  return (
    <Box className="inline-code-exercise-container glass-panel-strong" style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CodeIcon style={{ color: 'var(--primary-main)' }} />
          <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {blockType === 'write_line' ? 'Write the Line' : 'Fill the Code'}
          </Typography>
        </Box>
        <Chip size="small" label={language.toUpperCase()} style={{ background: 'rgba(28,176,246,0.1)', color: '#1CB0F6', fontWeight: 800 }} />
      </Box>

      {instruction && (
        <Typography variant="body1" style={{ marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {parseFormattedText(instruction)}
        </Typography>
      )}

      {fileName && (
        <Typography variant="caption" style={{ display: 'block', marginBottom: '10px', color: 'var(--text-secondary)', fontFamily: '"Roboto Mono", monospace', fontWeight: 600 }}>
          📄 {fileName}
        </Typography>
      )}

      <Box style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px', marginBottom: '18px', overflowX: 'auto' }}>
        <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace', fontSize: '0.85rem', color: 'var(--code-text-default)', lineHeight: 1.7 }}>
          {visualRows.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', minHeight: '28px' }}>
              {row.map(({ line, idx }) => {
                if (line.type === 'input') {
                  const val = inputValues[idx] || '';
                  const status = statuses[idx];
                  const widthCh = line.width || 12;

                  if (answered) {
                    const isInputCorrect = status === 'correct' || lastAnswerCorrect;
                    return (
                      <span key={idx} style={{ color: isInputCorrect ? '#4CAF50' : '#ef5350', fontWeight: 800, margin: '0 6px', borderBottom: `2.5px solid ${isInputCorrect ? '#4CAF50' : '#ef5350'}` }}>
                        {val || line.expectedAnswer}
                      </span>
                    );
                  }

                  if (line.multiline) {
                    return (
                      <textarea
                        key={idx}
                        value={val}
                        onChange={(e) => handleInputChange(idx, e.target.value)}
                        placeholder="// type code here..."
                        style={{
                          width: '100%',
                          minHeight: '90px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1.5px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontFamily: '"Roboto Mono", monospace',
                          padding: '10px',
                          marginTop: '6px',
                          marginBottom: '6px',
                          resize: 'vertical',
                          fontSize: '0.82rem'
                        }}
                      />
                    );
                  }

                  return (
                    <input
                      key={idx}
                      type="text"
                      value={val}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      style={{
                        width: `${widthCh * 8 + 35}px`,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontFamily: '"Roboto Mono", monospace',
                        padding: '3px 8px',
                        margin: '0 6px',
                        fontSize: '0.82rem'
                      }}
                    />
                  );
                }

                return (
                  <span key={idx} style={{ whiteSpace: 'pre' }}>
                    {highlightCppCode(line.content, isDarkMode)}
                  </span>
                );
              })}
            </div>
          ))}
        </pre>
      </Box>

      {!answered ? (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleCheck}
            disabled={isChecking}
            style={{
              background: 'var(--hero-gradient)',
              color: '#fff',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              padding: '10px 24px'}}
          >
            {isChecking ? 'Checking...' : 'Check Answer'}
          </Button>
          {validationError && (
            <Typography variant="body2" style={{ color: '#ef5350', fontWeight: 600, marginTop: '4px' }}>
              {validationError}
            </Typography>
          )}
        </Box>
      ) : (
        <Box style={{
          padding: '14px 16px',
          borderRadius: '12px',
          backgroundColor: lastAnswerCorrect ? 'rgba(76, 175, 80, 0.08)' : 'rgba(239, 83, 80, 0.08)',
          border: `1px solid ${lastAnswerCorrect ? 'rgba(76, 175, 80, 0.15)' : 'rgba(239, 83, 80, 0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {lastAnswerCorrect ? (
            <SuccessIcon style={{ color: '#4CAF50', fontSize: '20px' }} />
          ) : (
            <ErrorIcon style={{ color: '#ef5350', fontSize: '20px' }} />
          )}
          <Typography variant="body2" style={{ color: lastAnswerCorrect ? '#4CAF50' : '#ef5350', fontWeight: 700, lineHeight: 1.4 }}>
            {feedbackMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const ChallengePlaygroundDialog = ({
  open,
  onClose,
  challenge,
  isDarkMode,
  onSolved
}) => {
  const starter = challenge.starterCode?.lines?.join('\n') || challenge.starterCode?.codeSnippet?.lines?.join('\n') || '';
  const [code, setCode] = useState(starter);
  const [testCaseStatuses, setTestCaseStatuses] = useState([]);
  const [activeTab, setActiveTab] = useState('problem');
  const [splitPercent, setSplitPercent] = useState(40);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [allCasesPassed, setAllCasesPassed] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const isDraggingSplitRef = useRef(false);

  useEffect(() => {
    if (open) {
      setCode(starter);
      setTestCaseStatuses(challenge.testCases?.map(() => ({ status: 'idle', actual: '' })) || []);
      setActiveTab('problem');
      setIsConsoleOpen(false);
      setActiveConsoleTab('testcase');
      setSelectedTestCaseIdx(0);
      setAllCasesPassed(false);
      setIsCompiling(false);
    }
  }, [open, challenge]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSplitRef.current) {
        const container = document.getElementById('challenge-split-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const offset = e.clientX - rect.left;
          const newPercent = Math.max(25, Math.min(75, (offset / rect.width) * 100));
          setSplitPercent(newPercent);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplitRef.current) {
        isDraggingSplitRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const runTestCases = () => {
    if (isCompiling) return;
    if (!code || code.trim() === '') {
      alert("Please write some code before running.");
      return;
    }
    setIsCompiling(true);
    setIsConsoleOpen(true);
    setActiveConsoleTab('result');

    setTimeout(() => {
      const lang = challenge.starterCode?.language || challenge.language || 'cpp';
      const testCasesList = challenge.testCases || [];
      let allPassed = true;

      const newStatuses = testCasesList.map((tc) => {
        const res = simulateCodeExecution(code, tc.input || '', lang);
        if (res.isError) {
          allPassed = false;
          return {
            status: 'fail',
            actual: res.output,
            isError: true
          };
        } else {
          const actual = res.output.trim().replace(/\r/g, "");
          const expected = (tc.expectedOutput || '').trim().replace(/\r/g, "");
          const pass = actual === expected;
          if (!pass) allPassed = false;
          return {
            status: pass ? 'pass' : 'fail',
            actual: res.output,
            isError: false
          };
        }
      });

      setTestCaseStatuses(newStatuses);
      setAllCasesPassed(allPassed);
      setIsCompiling(false);
    }, 700);
  };

  const handleSubmit = () => {
    if (!code || code.trim() === '') {
      alert("Please write some code before submitting.");
      return;
    }
    const lang = challenge.starterCode?.language || challenge.language || 'cpp';
    let allPassed = true;
    const testCasesList = challenge.testCases || [];
    if (testCasesList.length === 0) {
      onSolved();
      onClose();
      return;
    }

    const newStatuses = testCasesList.map((tc) => {
      const res = simulateCodeExecution(code, tc.input || '', lang);
      const actual = res.output.trim().replace(/\r/g, "");
      const expected = (tc.expectedOutput || '').trim().replace(/\r/g, "");
      
      const pass = actual === expected && !res.isError;
      if (!pass) allPassed = false;
      return {
        status: pass ? 'pass' : 'fail',
        actual: res.output,
        isError: res.isError
      };
    });
    setTestCaseStatuses(newStatuses);
    setAllCasesPassed(allPassed);

    if (allPassed) {
      onSolved();
      onClose();
    } else {
      setIsConsoleOpen(true);
      setActiveConsoleTab('result');
    }
  };

  const hasUml = challenge.umlDiagram && challenge.umlDiagram.length > 0;
  const lang = challenge.starterCode?.language || challenge.language || 'cpp';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        style: {
          borderRadius: '24px',
          background: isDarkMode ? 'rgba(20, 20, 42, 0.98)' : 'rgba(252, 253, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          
          maxHeight: '95vh',
          width: '95vw'
        }
      }}
    >
      <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrophyIcon style={{ color: 'var(--primary-main)' }} />
          <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif' }}>
            LeetCode Challenge Playground
          </Typography>
        </Box>
        <IconButton onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ padding: '20px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box id="challenge-split-container" style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, height: '100%', minHeight: '50vh', alignItems: 'stretch', position: 'relative', overflow: 'hidden' }}>
          
          {/* Left Pane: Tabs (Description vs Testcases) */}
          <Box style={{ width: `${splitPercent}%`, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px', height: '100%', overflowY: 'hidden', paddingRight: '8px' }}>
            {/* Tabs Header */}
            <Box style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'flex-start' }}>
              <button
                onClick={() => setActiveTab('problem')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'problem' ? 'var(--primary-main)' : 'transparent',
                  color: activeTab === 'problem' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Problem Description
              </button>
              <button
                onClick={() => setActiveTab('testcases')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'testcases' ? 'var(--primary-main)' : 'transparent',
                  color: activeTab === 'testcases' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Test Cases
              </button>
            </Box>

            {/* Tab Body */}
            <Box style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {activeTab === 'problem' ? (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Box>
                    <Box style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography variant="h5" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>
                        Coding Challenge
                      </Typography>
                      <Chip label="Medium" size="small" style={{ background: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', fontWeight: 800, fontSize: '0.7rem' }} />
                    </Box>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.88rem' }}>
                      {challenge.problem}
                    </Typography>
                  </Box>

                  {hasUml && (
                    <Box style={{ marginTop: '4px' }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '8px', fontFamily: '"Outfit", sans-serif' }}>
                        UML Class Diagram
                      </Typography>
                      <UmlDiagram data={challenge.umlDiagram[0] || challenge.umlDiagram} compact />
                    </Box>
                  )}

                  {(challenge.inputFormat || challenge.outputFormat || challenge.constraints) && (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                      {challenge.inputFormat && (
                        <Box>
                          <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            Input Format
                          </Typography>
                          <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {challenge.inputFormat}
                          </Typography>
                        </Box>
                      )}
                      {challenge.outputFormat && (
                        <Box>
                          <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            Output Format
                          </Typography>
                          <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {challenge.outputFormat}
                          </Typography>
                        </Box>
                      )}
                      {challenge.constraints && (
                        <Box>
                          <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            Constraints
                          </Typography>
                          <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontFamily: '"Roboto Mono", monospace', fontSize: '0.78rem' }}>
                            {challenge.constraints}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {challenge.example && (
                    <Paper style={{ padding: '14px', background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--divider)', marginTop: '4px' }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--success-main)', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        Example Case
                      </Typography>
                      <Typography variant="body2" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                        <strong>Input:</strong> {challenge.example.input}
                      </Typography>
                      <Typography variant="body2" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: '"Roboto Mono", monospace', fontSize: '0.8rem' }}>
                        <strong>Output:</strong> {challenge.example.output}
                      </Typography>
                      {challenge.example.explanation && (
                        <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '6px', lineHeight: 1.4, fontSize: '0.78rem' }}>
                          <strong>Explanation:</strong> {challenge.example.explanation}
                        </Typography>
                      )}
                    </Paper>
                  )}
                </Box>
              ) : (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    Test Cases Results
                  </Typography>
                  {(challenge.testCases || []).map((tc, idx) => {
                    const statusInfo = testCaseStatuses[idx] || { status: 'idle', actual: '' };
                    const isPass = statusInfo.status === 'pass';
                    const isFail = statusInfo.status === 'fail';

                    return (
                      <Paper key={idx} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${isPass ? '#4CAF50' : isFail ? '#ef5350' : 'rgba(255,255,255,0.06)'}`, background: 'rgba(0,0,0,0.15)' }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <Typography variant="caption" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                            Test Case #{idx + 1}
                          </Typography>
                          <Chip
                            size="small"
                            label={isPass ? 'PASS' : isFail ? 'FAIL' : 'UNRUN'}
                            style={{
                              background: isPass ? 'rgba(76, 175, 80, 0.15)' : isFail ? 'rgba(239, 83, 80, 0.15)' : 'rgba(255,255,255,0.05)',
                              color: isPass ? '#66bb6a' : isFail ? '#ef5350' : 'var(--text-secondary)',
                              fontWeight: 800,
                              fontSize: '0.68rem'
                            }}
                          />
                        </Box>
                        <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontFamily: '"Roboto Mono", monospace', marginBottom: '2px' }}>
                          <strong>Input:</strong> {tc.input || '(empty stream)'}
                        </Typography>
                        <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontFamily: '"Roboto Mono", monospace', marginBottom: '4px' }}>
                          <strong>Expected:</strong> {tc.expectedOutput}
                        </Typography>
                        {statusInfo.actual && (
                          <Typography variant="caption" style={{ display: 'block', color: isPass ? '#4CAF50' : '#ef5350', fontFamily: '"Roboto Mono", monospace', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px', marginTop: '4px' }}>
                            <strong>Output:</strong> {statusInfo.actual}
                          </Typography>
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>

          {/* Resizable Divider */}
          <Box
            onMouseDown={(e) => {
              e.preventDefault();
              isDraggingSplitRef.current = true;
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            }}
            style={{
              width: '8px',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '-4px',
              marginRight: '-4px'}}
            sx={{
              '&:hover, &:active': {
                backgroundColor: 'var(--primary-main)'},
              '&::after': {
                content: '""',
                width: '2px',
                height: '40px',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                borderRadius: '1px'}
            }}
          />

          {/* Right Pane: Editor + Console drawer */}
          <Box style={{ width: `${100 - splitPercent}%`, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px', height: '100%' }}>
            {/* Monaco Editor Wrapper */}
            <Box style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fffffe',
              
              position: 'relative',
              height: isConsoleOpen ? '32vh' : '56vh',
              transition: 'height 0.2s ease-in-out'
            }}>
              <Editor
                height="100%"
                language={lang === 'cpp' ? 'cpp' : 'java'}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme={isDarkMode ? 'vs-dark' : 'light'}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  lineNumbersMinChars: 3
                }}
              />
            </Box>

            {/* LeetCode-style Collapsible Console Drawer */}
            <Box style={{
              border: '1.5px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              background: isDarkMode ? '#141418' : '#fafafa',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: isConsoleOpen ? '260px' : '40px',
              transition: 'height 0.2s ease-in-out'
            }}>
              {/* Header bar */}
              <Box
                style={{
                  padding: '6px 16px',
                  background: isDarkMode ? '#1e1e24' : '#eaeaea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: isConsoleOpen ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}
                onClick={() => setIsConsoleOpen(prev => !prev)}
              >
                <Box style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TerminalIcon style={{ fontSize: '0.9rem', color: 'var(--primary-main)' }} />
                    <Typography variant="caption" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Console
                    </Typography>
                  </Box>
                  
                  {isConsoleOpen && (
                    <Box style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveConsoleTab('testcase')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderBottom: activeConsoleTab === 'testcase' ? '2px solid var(--primary-main)' : '2px solid transparent',
                          color: activeConsoleTab === 'testcase' ? (isDarkMode ? '#fff' : '#000') : 'rgba(128,128,128,0.7)',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}
                      >
                        Testcases
                      </button>
                      <button
                        onClick={() => setActiveConsoleTab('result')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderBottom: activeConsoleTab === 'result' ? '2px solid var(--primary-main)' : '2px solid transparent',
                          color: activeConsoleTab === 'result' ? (isDarkMode ? '#fff' : '#000') : 'rgba(128,128,128,0.7)',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}
                      >
                        Result
                      </button>
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  {isConsoleOpen ? '▼ Minimize' : '▲ Expand'}
                </Typography>
              </Box>

              {/* Drawer Content */}
              {isConsoleOpen && (
                <Box style={{ padding: '16px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {activeConsoleTab === 'testcase' ? (
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Box style={{ display: 'flex', gap: '8px' }}>
                        {(challenge.testCases || []).map((_, idx) => (
                          <Chip
                            key={idx}
                            label={`Case ${idx + 1}`}
                            size="small"
                            onClick={() => setSelectedTestCaseIdx(idx)}
                            style={{
                              background: selectedTestCaseIdx === idx ? (isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                              color: isDarkMode ? '#fff' : '#000',
                              fontWeight: selectedTestCaseIdx === idx ? 800 : 400
                            }}
                          />
                        ))}
                      </Box>
                      {challenge.testCases && challenge.testCases[selectedTestCaseIdx] && (
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                          <Box>
                            <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800, display: 'block' }}>INPUT</Typography>
                            <pre style={{ margin: '4px 0 0', padding: '8px', background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', color: isDarkMode ? '#fff' : '#000' }}>
                              {challenge.testCases[selectedTestCaseIdx].input || '(empty input)'}
                            </pre>
                          </Box>
                          <Box>
                            <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800, display: 'block' }}>EXPECTED OUTPUT</Typography>
                            <pre style={{ margin: '4px 0 0', padding: '8px', background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', color: isDarkMode ? '#fff' : '#000' }}>
                              {challenge.testCases[selectedTestCaseIdx].expectedOutput}
                            </pre>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    // Result Tab
                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                      {isCompiling ? (
                        <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          Compiling & running test cases...
                        </Typography>
                      ) : testCaseStatuses.length > 0 ? (
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Typography variant="subtitle2" style={{ fontWeight: 800, color: allCasesPassed ? '#4CAF50' : '#ef5350' }}>
                              {allCasesPassed ? 'Accepted ✅' : 'Wrong Answer ❌'}
                            </Typography>
                            <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                              ({testCaseStatuses.filter(s => s.status === 'pass').length}/{testCaseStatuses.length} cases passed)
                            </Typography>
                          </Box>

                          <Box style={{ display: 'flex', gap: '8px' }}>
                            {testCaseStatuses.map((st, idx) => (
                              <Chip
                                key={idx}
                                label={`Case ${idx + 1}`}
                                size="small"
                                onClick={() => setSelectedTestCaseIdx(idx)}
                                style={{
                                  background: selectedTestCaseIdx === idx ? (isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                  color: st.status === 'pass' ? '#66bb6a' : '#ef5350',
                                  fontWeight: selectedTestCaseIdx === idx ? 800 : 400,
                                  border: `1.5px solid ${st.status === 'pass' ? 'rgba(102,187,106,0.3)' : 'rgba(239,83,80,0.3)'}`
                                }}
                              />
                            ))}
                          </Box>

                          {challenge.testCases && challenge.testCases[selectedTestCaseIdx] && (
                            <Box style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                <strong>Input:</strong> {challenge.testCases[selectedTestCaseIdx].input || '(empty)'}
                              </Typography>
                              <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                <strong>Expected:</strong> {challenge.testCases[selectedTestCaseIdx].expectedOutput}
                              </Typography>
                              {testCaseStatuses[selectedTestCaseIdx] && (
                                <Typography variant="caption" style={{
                                  color: testCaseStatuses[selectedTestCaseIdx].status === 'pass' ? '#66bb6a' : '#ef5350',
                                  fontFamily: 'monospace',
                                  background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
                                  padding: '6px',
                                  borderRadius: '4px',
                                  marginTop: '4px',
                                  whiteSpace: 'pre-wrap',
                                  display: 'block'
                                }}>
                                  <strong>Actual Output:</strong> {testCaseStatuses[selectedTestCaseIdx].actual}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                          Please run your code to see the test case results.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <DialogActions style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsConsoleOpen(prev => !prev)}
            startIcon={<TerminalIcon />}
            style={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
          >
            Console
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={runTestCases}
            style={{ borderRadius: '8px', textTransform: 'none', fontWeight: 800 }}
          >
            Test Code
          </Button>
        </Box>

        <Button
          variant="contained"
          onClick={handleSubmit}
          style={{
            background: 'var(--hero-gradient)',
            color: '#fff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 800,
            padding: '6px 20px'}}
        >
          Submit Solution
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const LEARNING_QUOTES = [
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. — Brian Herbert",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi",
  "Intellectual growth should commence at birth and cease only at death. — Albert Einstein",
  "The beautiful thing about learning is that nobody can take it away from you. — B.B. King",
  "Do not fear failure. Fear being in the exact same place next year as you are today.",
  "Wisdom is not a product of schooling but of the lifelong attempt to acquire it. — Albert Einstein",
  "Continuous improvement is better than delayed perfection. — Mark Twain",
  "The only true wisdom is in knowing you know nothing. — Socrates",
  "Be not afraid of going slowly, be afraid only of standing still. — Chinese Proverb",
  "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. — Malcolm X",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch",
  "Learning is the only thing the mind never exhausts, never fears, and never regrets. — Leonardo da Vinci",
  "Develop a passion for learning. If you do, you will never cease to grow. — Anthony J. D'Angelo",
  "All life is an experiment. The more experiments you make the better. — Ralph Waldo Emerson",
  "Growth begins at the end of your comfort zone. Stretch your boundaries.",
  "The more that you read, the more things you will know. The more that you learn, the more places you'll go. — Dr. Seuss",
  "Every master was once a beginner. Keep pushing forward.",
  "In a world of constant change, the learners inherit the earth.",
  "Small daily improvements over time lead to stunning results. Focus on 1% better every day."
];

const LearningContentPage = () => {
  const { courseId, sectionId, lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateQuizScore, refreshUser } = useAuth();

  const isComputerScience = courseId?.toLowerCase()?.includes('computer-science') || String(courseId) === '2';

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [lesson, setLesson] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [portalElement, setPortalElement] = useState(null);

  useEffect(() => {
    const target = document.querySelector('.nav-content');
    if (target) setPortalElement(target);
  }, []);

  // Reset scroll position to top when switching slides
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPageIndex]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * LEARNING_QUOTES.length);
    return LEARNING_QUOTES[randomIndex];
  });
  const [completionSaved, setCompletionSaved] = useState(false);

  // Premium Interactive Illustration States
  const [activeCardId, setActiveCardId] = useState(null);
  const [activeDetail, setActiveDetail] = useState('');
  const [simulatedSecurityStatus, setSimulatedSecurityStatus] = useState('secure');
  const [simulatedLog, setSimulatedLog] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [isCompilerOpen, setIsCompilerOpen] = useState(false);
  const [compilerInitialCode, setCompilerInitialCode] = useState('');

  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [blockSelectedIndex, setBlockSelectedIndex] = useState({});
  const [blankValues, setBlankValues] = useState({});
  const [blankStatuses, setBlankStatuses] = useState({});
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedChallengeBlockIdx, setSelectedChallengeBlockIdx] = useState(null);

  const isPageCompleted = (pageIdx) => {
    const page = pages[pageIdx];
    if (!page || !page.blocks) return true;
    for (let idx = 0; idx < page.blocks.length; idx++) {
      const block = page.blocks[idx];
      if (['mcq', 'fill_code', 'write_line', 'find_error', 'code_challenge'].includes(block.type)) {
        const key = _blockKey(pageIdx, idx);
        if (exerciseAnswers[key] === undefined) {
          return false;
        }
      } else if (block.type === 'vulnerability_challenge') {
        const key = _blockKey(pageIdx, idx);
        if (exerciseAnswers[key] !== true) {
          return false;
        }
      }
    }
    return true;
  };

  // Reset interactive states when page changes
  useEffect(() => {
    setActiveCardId(null);
    setActiveDetail('');
    setSimulatedSecurityStatus('secure');
    setSimulatedLog('');
    setActiveTab(0);
  }, [currentPageIndex]);

  useEffect(() => {
    const loadLessonContent = async () => {
      const startTime = Date.now();
      setIsLoading(true);
      try {
        let dbId = courseId;
        // If it's a string, find the database ID
        if (isNaN(Number(dbId))) {
          const res = await fetch('/courses');
          if (res.ok) {
            const list = await res.json();
            const matched = list.find(c => c.title.toLowerCase() === courseId.toLowerCase() || c.title.toLowerCase().replace(/\s+/g, '-') === courseId.toLowerCase());
            if (matched) dbId = matched.id;
          }
        }

        let targetSectionId = sectionId;

        // Query the database to find which course and section this lesson ID actually belongs to
        const exportRes = await fetch('/courses');
        if (exportRes.ok) {
          const allCourses = await exportRes.json();
          let found = false;
          for (const c of allCourses) {
            for (const s of (c.sections || [])) {
              if (s.lessons && s.lessons.some(l => String(l.id) === String(lessonId))) {
                dbId = c.id;
                targetSectionId = s.id;
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }

        // Call the backend endpoint to get specific lesson
        const lessonRes = await fetch(`/courses/${dbId}/sections/${targetSectionId}/lessons/${lessonId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (lessonRes.ok) {
          const data = await lessonRes.json();
          setLesson(data);
        } else {
          throw new Error('Fallback to local');
        }
      } catch (err) {
        console.warn('Backend lesson not found, loading local fallback:', err);
        // Fallback to local mock data
        let localCourse = location.state?.course || coursesData.find(c => c.id === courseId);
        let localLesson = localCourse?.sections
          ?.find(s => String(s.id) === String(sectionId))
          ?.lessons?.find(l => String(l.id) === String(lessonId));
        
        // If not found in the current course, search all other local courses
        if (!localLesson) {
          for (const c of coursesData) {
            for (const s of c.sections || []) {
              const les = (s.lessons || []).find(l => String(l.id) === String(lessonId));
              if (les) {
                localCourse = c;
                localLesson = les;
                break;
              }
            }
            if (localLesson) break;
          }
        }
        
        if (localLesson) {
          // Structure it similar to backend response
          setLesson({
            id: localLesson.id,
            title: localLesson.title,
            category: 'learning',
            pages: localLesson.pages || []
          });
        }
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 5000 - elapsedTime;
        if (remainingTime > 0) {
          setTimeout(() => {
            setIsLoading(false);
          }, remainingTime);
        } else {
          setIsLoading(false);
        }
      }
    };

    loadLessonContent();
  }, [courseId, sectionId, lessonId, location.state]);

  const hasPages = lesson && lesson.pages && lesson.pages.length > 0;
  const pages = lesson?.pages || [];

  const handleDownloadCheatsheet = () => {
    if (!lesson) return;

    const loadJsPDF = () => {
      return new Promise((resolve, reject) => {
        if (window.jspdf) {
          resolve(window.jspdf.jsPDF);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
          resolve(window.jspdf.jsPDF);
        };
        script.onerror = () => {
          reject(new Error("Failed to load jsPDF"));
        };
        document.head.appendChild(script);
      });
    };

    setIsExportingPdf(true);

    setTimeout(async () => {
      try {
        const jsPDFClass = await loadJsPDF();
        const exportContainer = document.getElementById('cheatsheet-pdf-export-container');
        if (!exportContainer) {
          throw new Error("Export container not found");
        }

        const originalSlides = exportContainer.querySelectorAll('.cheatsheet-pdf-export-slide');
        if (originalSlides.length === 0) {
          throw new Error("No slides found for export");
        }

        // Create a temporary hidden container to render our split sub-slides
        const tempContainer = document.createElement('div');
        tempContainer.id = 'cheatsheet-pdf-temp-container';
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '800px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.backgroundColor = 'var(--background-default)';
        tempContainer.style.color = 'var(--text-primary)';
        tempContainer.style.padding = '40px';
        document.body.appendChild(tempContainer);

        const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--background-default').trim() || '#1E1E38';
        const maxPageHeight = 850; // Maximum allowed block height per page in sub-slide

        // Distribute blocks into sub-slides
        for (let i = 0; i < originalSlides.length; i++) {
          const origSlide = originalSlides[i];
          const titleEl = origSlide.querySelector('h2');
          const titleText = titleEl ? titleEl.innerText : `Section ${i + 1}`;
          const blocks = origSlide.querySelectorAll('.cheatsheet-pdf-block');

          let currentSubSlide = null;
          let currentSubSlideBlocksList = null;
          let currentHeight = 0;
          let subSlideIndex = 1;

          const createNewSubSlide = () => {
            currentSubSlide = document.createElement('div');
            currentSubSlide.className = 'cheatsheet-pdf-export-slide';
            currentSubSlide.style.backgroundColor = 'var(--background-paper)';
            currentSubSlide.style.border = '1px solid var(--divider)';
            currentSubSlide.style.borderRadius = '16px';
            currentSubSlide.style.padding = '40px';
            currentSubSlide.style.marginBottom = '30px';
            currentSubSlide.style.boxSizing = 'border-box';
            currentSubSlide.style.width = '720px'; // 800px - padding

            const subTitleEl = document.createElement('h2');
            subTitleEl.style.fontFamily = 'Outfit, sans-serif';
            subTitleEl.style.fontSize = '1.8rem';
            subTitleEl.style.fontWeight = '700';
            subTitleEl.style.color = 'var(--primary-main)';
            subTitleEl.style.marginTop = '0';
            subTitleEl.style.marginBottom = '20px';
            subTitleEl.innerText = subSlideIndex === 1 ? titleText : `${titleText} (Cont.)`;
            currentSubSlide.appendChild(subTitleEl);

            currentSubSlideBlocksList = document.createElement('div');
            currentSubSlideBlocksList.className = 'slide-blocks-list';
            currentSubSlide.appendChild(currentSubSlideBlocksList);

            tempContainer.appendChild(currentSubSlide);
            currentHeight = 60; // Base height for margins + header
            subSlideIndex++;
          };

          createNewSubSlide();

          for (let j = 0; j < blocks.length; j++) {
            const block = blocks[j];
            const clonedBlock = block.cloneNode(true);
            const blockHeight = block.offsetHeight || 100;

            if (currentHeight + blockHeight > maxPageHeight && currentSubSlideBlocksList.children.length > 0) {
              createNewSubSlide();
            }

            currentSubSlideBlocksList.appendChild(clonedBlock);
            currentHeight += blockHeight + 16;
          }
        }

        const subSlides = tempContainer.querySelectorAll('.cheatsheet-pdf-export-slide');

        const pdf = new jsPDFClass({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < subSlides.length; i++) {
          const slide = subSlides[i];
          const canvas = await html2canvas(slide, {
            scale: 2,
            useCORS: true,
            backgroundColor: themeBg,
            scrollY: 0,
            scrollX: 0
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          const padding = 30;
          const maxAllowedWidth = pdfWidth - (padding * 2);
          const maxAllowedHeight = pdfHeight - (padding * 2);

          let imgWidth = maxAllowedWidth;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (imgHeight > maxAllowedHeight) {
            imgHeight = maxAllowedHeight;
            imgWidth = (canvas.width * imgHeight) / canvas.height;
          }

          if (i > 0) {
            pdf.addPage();
          }

          pdf.setFillColor(themeBg);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

          const xOffset = (pdfWidth - imgWidth) / 2;
          const yOffset = (pdfHeight - imgHeight) / 2;

          pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
        }

        document.body.removeChild(tempContainer);

        pdf.save(`${lesson.title.replace(/\s+/g, '_')}_Cheatsheet.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Failed to generate PDF cheatsheet. Please try again.");
      } finally {
        setIsExportingPdf(false);
      }
    }, 600);
  };
  const currentPage = hasPages ? pages[currentPageIndex] : null;
  const progress = hasPages ? ((currentPageIndex + 1) / pages.length) * 100 : 0;

  const handleNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowRight') {
        if (currentPageIndex < pages.length - 1 && isPageCompleted(currentPageIndex)) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPageIndex, pages.length, isPageCompleted, handleNext, handlePrevious]);

  const handleFinish = async () => {
    let grade = 100;
    let totalCount = 0;
    let correctCount = 0;
    pages.forEach((page, pageIdx) => {
      if (page.blocks) {
        page.blocks.forEach((block, blockIdx) => {
          if (['mcq', 'fill_code', 'write_line', 'find_error', 'code_challenge', 'vulnerability_challenge'].includes(block.type)) {
            totalCount++;
            const key = _blockKey(pageIdx, blockIdx);
            if (exerciseAnswers[key] === true) {
              correctCount++;
            }
          }
        });
      }
    });
    if (totalCount > 0) {
      grade = Math.round((correctCount / totalCount) * 100);
    }

    if (!completionSaved && lesson?.id) {
      setCompletionSaved(true);
      const token = localStorage.getItem('token');

      // Find all duplicate C++ lessons inside this course that share the same title
      let allLessons = [];
      try {
        if (location.state?.course?.sections) {
          allLessons = location.state.course.sections.flatMap(s => s.lessons || []);
        } else {
          const fallback = coursesData.find(c => String(c.id) === String(courseId) || c.title.toLowerCase().replace(/\s+/g, '-') === String(courseId).toLowerCase());
          allLessons = fallback?.sections?.flatMap(s => s.lessons || []) || [];
        }
      } catch (_) {}

      const duplicates = allLessons.filter(l => (l.title || '').trim().toLowerCase() === (lesson.title || '').trim().toLowerCase());
      const idsToUpdate = duplicates.length > 0 ? duplicates.map(d => d.id) : [lesson.id];

      try {
        // Sync grades and completions for all duplicate entries
        await Promise.all(idsToUpdate.map(async (lid) => {
          await fetch(`/courses/me/lessons/${lid}/grade`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ grade })
          });
          
          await fetch(`/courses/me/lessons/${lid}/done`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }));
        await refreshUser();
      } catch (err) {
        console.error('Failed to report dynamic duplicate completions to backend:', err);
      }

      // Sync local AuthContext score state
      idsToUpdate.forEach(lid => {
        updateQuizScore(lid, grade);
      });
    }
    
    const originalCourseId = location.state?.course?.id || courseId;
    navigate(`/learning-path/${originalCourseId}`, { state: { ...location.state, lessonFinished: { lessonId: lesson.id, score: grade } } });
  };

  const renderBlock = (block, idx) => {
    // Recursively render container blocks that wrap other blocks
    if (!block.type && block.blocks && Array.isArray(block.blocks)) {
      return (
        <Box key={idx}>
          {block.blocks.map((childBlock, childIdx) => renderBlock(childBlock, `${idx}-${childIdx}`))}
        </Box>
      );
    }

    switch (block.type) {
      case 'Cyber': {
        const value = block.value || '';
        const isMitigated = value.endsWith('-patch');
        const labType = isMitigated ? value.slice(0, -6) : value;

        let labComponent = null;
        let labTitle = '';

        switch (labType) {
          case 'DOS':
            labComponent = <DenialOfServiceLab startMitigated={isMitigated} />;
            labTitle = isMitigated ? 'Denial of Service (DoS) Mitigation Lab' : 'Denial of Service (DoS) Attack Lab';
            break;
          case 'DDOS':
            labComponent = <DistributedDenialOfServiceLab startMitigated={isMitigated} />;
            labTitle = isMitigated ? 'Distributed Denial of Service (DDoS) Mitigation Lab' : 'Distributed Denial of Service (DDoS) Attack Lab';
            break;
          case 'RANSOMWARE':
            labComponent = <RansomwareLab startMitigated={isMitigated} />;
            labTitle = isMitigated ? 'Ransomware Protection (EDR) Lab' : 'Ransomware Infiltration Lab';
            break;
          case 'SOCIAL':
            labComponent = <SocialEngineeringLab startMitigated={isMitigated} />;
            labTitle = isMitigated ? 'Social Engineering Defense Lab' : 'Social Engineering Attack Simulator';
            break;
          case 'INSIDER':
            labComponent = <InsiderThreatLab startMitigated={isMitigated} />;
            labTitle = isMitigated ? 'Insider Threat Detection (UEBA/DLP) Lab' : 'Insider Threat Exfiltration Simulator';
            break;
          default:
            return null;
        }

        return (
          <Box
            key={idx}
            className="cyber-lab-block-inline glass-panel"
            sx={{
              p: 3,
              my: 4,
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              
              backdropFilter: 'blur(4px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'}}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: 'var(--primary-main)',
                mb: 3,
                textAlign: 'center',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'}}
            >
              {labTitle}
            </Typography>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                overflowX: 'auto',
                '& > *': {
                  transform: 'scale(0.9)',
                  transformOrigin: 'top center',
                  my: -2}
              }}
            >
              {labComponent}
            </Box>
          </Box>
        );
      }

      case 'vulnerability_challenge': {
        const key = _blockKey(currentPageIndex, idx);
        return (
          <VulnerabilityChallengeWidget
            key={idx}
            chapterId={Number(lessonId)}
            block={block}
            isDarkMode={isDarkMode}
            onAnswered={(isCorrect) => {
              setExerciseAnswers(prev => ({ ...prev, [key]: isCorrect }));
            }}
            initiallyAnswered={exerciseAnswers[key] === true}
          />
        );
      }

      case 'socratic_dialogue':
        return <SocraticDialogueWidget key={idx} isDarkMode={isDarkMode} />;
      case 'logic_truth_table':
        return (
          <Paper className="glass-panel" key={idx} style={{ padding: '20px', textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="body2" style={{ color: 'var(--text-secondary)' }}>
              Logic Truth Table Exercise is no longer available.
            </Typography>
          </Paper>
        );
      case 'fallacies_sorter':
        return <FallacySorterWidget key={idx} />;
      case 'thought_experiment_ship':
        return <ShipOfTheseusWidget key={idx} />;
      case 'thought_experiment_trolley':
        return <TrolleyProblemWidget key={idx} />;
      case 'thought_experiment_experience_machine':
      case 'thought_experiment_platos_cave':
        return <PlatosCaveWidget key={idx} />;

      case 'uml_diagram':
        return (
          <UmlDiagram key={idx} data={block.raw || block} />
        );

      case 'mcq':
      case 'find_error': {
        const questionText = block.question || block.instruction || block.text || '';
        const answers = block.answers || block.raw?.answers || [];
        const correctAnswer = block.correctAnswer !== undefined ? block.correctAnswer : (block.correctAnswerIndex !== undefined ? block.correctAnswerIndex : (block.raw?.correctAnswer !== undefined ? block.raw.correctAnswer : 0));
        const codeSnippet = block.codeSnippet || block.raw?.codeSnippet || null;
        const key = _blockKey(currentPageIndex, idx);

        return (
          <InlineMcqWidget
            key={idx}
            question={questionText}
            answers={answers}
            correctAnswerIndex={correctAnswer}
            codeSnippet={codeSnippet}
            initiallyAnswered={exerciseAnswers[key] !== undefined}
            initialSelectedIndex={blockSelectedIndex[key]}
            isDarkMode={isDarkMode}
            onAnswered={(selectedIdx, isCorrect) => {
              setBlockSelectedIndex(prev => ({ ...prev, [key]: selectedIdx }));
              setExerciseAnswers(prev => ({ ...prev, [key]: isCorrect }));
            }}
          />
        );
      }

      case 'fill_code':
      case 'write_line': {
        const key = _blockKey(currentPageIndex, idx);
        const instruction = block.instruction || block.raw?.instruction || '';
        const fileName = block.fileName || block.raw?.fileName || '';
        const template = block.codeTemplate || block.raw?.codeTemplate || {};
        const codeLines = template.lines || [];
        const language = template.language || block.language || block.raw?.language || 'cpp';

        return (
          <InlineCodeExerciseWidget
            key={idx}
            blockType={block.type}
            instruction={instruction}
            fileName={fileName}
            codeLines={codeLines}
            language={language}
            initiallyAnswered={exerciseAnswers[key] !== undefined}
            initialInputValues={blankValues[key]}
            isDarkMode={isDarkMode}
            onAnswered={(isCorrect) => {
              setExerciseAnswers(prev => ({ ...prev, [key]: isCorrect }));
            }}
          />
        );
      }

      case 'code_challenge': {
        const key = _blockKey(currentPageIndex, idx);
        const isSolved = exerciseAnswers[key] === true;

        return (
          <Box key={idx} className="code-challenge-block glass-panel" style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrophyIcon style={{ color: isSolved ? '#4CAF50' : 'var(--primary-main)' }} />
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  Code Challenge
                </Typography>
              </Box>
              {isSolved && (
                <Chip size="small" label="Solved" color="success" style={{ fontWeight: 800 }} />
              )}
            </Box>

            <Typography variant="body1" style={{ color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              {block.problem || block.raw?.problem || ''}
            </Typography>

            <Button
              variant="contained"
              onClick={() => {
                setSelectedChallenge(block.raw || block);
                setSelectedChallengeBlockIdx(idx);
                setIsChallengeOpen(true);
              }}
              style={{
                background: isSolved ? 'rgba(76, 175, 80, 0.12)' : 'var(--hero-gradient)',
                color: isSolved ? '#4CAF50' : '#fff',
                border: isSolved ? '1.5px solid #4CAF50' : 'none',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 800,
                padding: '10px 22px'
              }}
            >
              {isSolved ? 'Retake Challenge' : 'Solve Challenge'}
            </Button>
          </Box>
        );
      }

      case 'heading': {
        const level = block.level || 1;
        const variant = level === 1 ? 'h4' : level === 2 ? 'h5' : 'h6';
        return (
          <Typography
            key={idx}
            variant={variant}
            className={`slide-heading slide-h${level}`}
            gutterBottom
          >
            {parseFormattedText(block.text, true)}
          </Typography>
        );
      }

      case 'paragraph':
        return (
          <Typography key={idx} variant="body1" className="slide-paragraph">
            {parseFormattedText(block.text)}
          </Typography>
        );

      case 'bullet_list':
        return (
          <ul key={idx} className="slide-bullet-list">
            {block.items?.map((item, i) => (
              <li key={i} className="slide-bullet-item">
                {item.bold && <strong className="slide-bullet-bold">{item.bold}</strong>}
                <span className="slide-bullet-text">{parseFormattedText(item.text)}</span>
              </li>
            ))}
          </ul>
        );

      case 'callout': {
        const variant = block.variant || 'info';
        const icon =
          variant === 'warning' ? <WarningIcon className="callout-icon warning" /> :
          variant === 'success' ? <SuccessIcon className="callout-icon success" /> :
          variant === 'error' ? <ErrorIcon className="callout-icon error" /> :
          <InfoIcon className="callout-icon info" />;
        
        return (
          <Box key={idx} className={`slide-callout ${variant}`}>
            {icon}
            <Typography variant="body2" className="callout-text">
              {parseFormattedText(block.text)}
            </Typography>
          </Box>
        );
      }

      case 'table':
        return (
          <Paper key={idx} className="slide-table-container glass-panel" elevation={0}>
            <table className="slide-table">
              {block.headers && block.headers.length > 0 && (
                <thead>
                  <tr>
                    {block.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {block.rows?.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        {cell.bold && <strong>{cell.bold}</strong>}
                        {parseFormattedText(cell.text)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        );

      case 'normal_code': {
        const snippet = block.codeSnippet || block.raw?.codeSnippet || {};
        const language = snippet.language || block.raw?.language || block.language || 'code';
        const rawLines = snippet.lines || block.raw?.lines || block.lines || block.text?.split('\n') || [];
        const isCpp = language.toLowerCase() === 'cpp' || language.toLowerCase() === 'c++';
        const isRunable = block.runable !== false && (block.raw?.runable !== false);

        return (
          <Paper key={idx} className="slide-code-card" elevation={0}>
            <div className="code-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CodeIcon fontSize="small" className="code-header-icon" />
                <span>{language.toUpperCase()}</span>
              </div>
              {isCpp && isComputerScience && isRunable && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    setCompilerInitialCode(rawLines.join('\n'));
                    setIsCompilerOpen(true);
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'var(--hero-gradient)',
                    color: '#fff'}}
                >
                  Run Code
                </Button>
              )}
            </div>
            <div className="code-card-body">
              <pre className="code-pre">
                {rawLines.map((line, lIdx) => (
                  <div key={lIdx} className="code-line">
                    <span className="code-line-number">{lIdx + 1}</span>
                    <span className="code-line-content">{highlightCppCode(line, isDarkMode)}</span>
                  </div>
                ))}
              </pre>
            </div>
          </Paper>
        );
      }

      case 'image': {
        const src = block.src || block.url || block.raw?.src || block.raw?.url || '';
        const alt = block.alt || block.caption || block.text || block.raw?.alt || '';

        // 1. Interactive input stream (cin)
        if (src.includes('cin_example') || src.includes('cin')) {
          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Visual Flow: C++ Input Stream (cin)
              </Typography>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '14px', margin: '20px 0' }}>
                {/* Keyboard input */}
                <Box style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>Keyboard</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>Input Device</Typography>
                </Box>

                <span style={{ fontSize: '1.25rem', color: 'var(--primary-main)' }}>➔</span>

                {/* std::cin buffer */}
                <Box style={{ padding: '12px 18px', background: 'var(--primary-main)', borderRadius: '10px', color: '#fff', textAlign: 'center'}}>
                  <Typography variant="body2" style={{ fontWeight: 800 }}>std::cin</Typography>
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>Input Buffer</Typography>
                </Box>

                {/* Extraction operator */}
                <Box style={{ padding: '8px 12px', background: 'rgba(28,176,246,0.1)', borderRadius: '8px', border: '1.5px solid var(--primary-main)', fontFamily: 'monospace', fontWeight: 900, color: '#1CB0F6' }}>
                  &gt;&gt;
                </Box>

                {/* Variable memory */}
                <Box style={{ padding: '12px 18px', background: 'rgba(76,175,80,0.1)', borderRadius: '10px', border: '1px solid rgba(76,175,80,0.25)', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 700, color: '#4CAF50' }}>Variables</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>Stored in RAM</Typography>
                </Box>
              </div>

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '10px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 2. Interactive hardware components
        if (src.includes('hardware') || src.includes('component')) {
          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Interactive Hardware Architecture Diagram
              </Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', margin: '20px 0' }}>
                <Box style={{ padding: '12px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 700, fontSize: '0.8rem' }}>INPUT</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Keyboard</Typography>
                </Box>
                <Box style={{ padding: '12px 6px', background: 'rgba(28,176,246,0.1)', borderRadius: '10px', border: '1.5px solid var(--primary-main)', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1CB0F6' }}>CPU</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Control / ALU</Typography>
                </Box>
                <Box style={{ padding: '12px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 700, fontSize: '0.8rem' }}>MEMORY</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>RAM</Typography>
                </Box>
                <Box style={{ padding: '12px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 700, fontSize: '0.8rem' }}>STORAGE</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>HDD / SSD</Typography>
                </Box>
                <Box style={{ padding: '12px 6px', background: 'rgba(76,175,80,0.1)', borderRadius: '10px', border: '1.5px solid #4CAF50', textAlign: 'center' }}>
                  <Typography variant="body2" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#4CAF50' }}>OUTPUT</Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Monitor</Typography>
                </Box>
              </div>
              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '10px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 3. Interactive multi-byte memory cell grid
        if (src.includes('memory') || src.includes('byte')) {
          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Multi-Byte Memory Cell Grid
              </Typography>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '320px', margin: '20px auto' }}>
                {[...Array(8)].map((_, cIdx) => (
                  <Box key={cIdx} style={{ padding: '10px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                    <Typography variant="caption" style={{ fontFamily: 'monospace', color: 'var(--primary-main)', display: 'block', fontSize: '0.7rem' }}>0x100{cIdx}</Typography>
                    <Typography variant="body2" style={{ fontWeight: 800, fontSize: '0.78rem' }}>Byte {cIdx + 1}</Typography>
                  </Box>
                ))}
              </div>
              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '10px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 4. Interactive Computer System Overview board
        if (src.includes('computer_system_overview')) {
          const hwPills = [
            { id: 'cpu', name: 'CPU (Processor)', desc: 'The Brain. Executes all instructions, compiles computations, and coordinates device actions.' },
            { id: 'ram', name: 'RAM (Main Memory)', desc: 'Temporary Workspace. Highly fast, volatile memory where active programs and variables live.' },
            { id: 'storage', name: 'Storage (Disk)', desc: 'Permanent Filing Cabinet. Slower, non-volatile space (HDD/SSD) where files, operating systems, and programs reside permanently.' },
            { id: 'io', name: 'I/O Devices', desc: 'Communication Bridge. Includes Input (Keyboard, Mouse) to feed data and Output (Monitor, Printer) to present results.' }
          ];

          const swPills = [
            { id: 'os', name: 'Operating System', desc: 'The Manager. System software (Windows, macOS, Linux) that manages hardware allocations and hosts user applications.' },
            { id: 'app', name: 'Application Software', desc: 'The Tools. User-oriented software (Web Browsers, Games, IDEs, Duolingo) designed to perform specific user tasks.' },
            { id: 'driver', name: 'Device Drivers', desc: 'The Translators. Specialized software elements that let the OS communicate smoothly with physical hardware units.' }
          ];

          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Interactive Computer System Architecture
              </Typography>
              <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Click Hardware or Software to explore its internal system components!
              </Typography>

              <div className="interactive-system-board">
                {/* Hardware */}
                <div 
                  className={`system-column-card ${activeCardId === 'hardware' ? 'active' : ''}`}
                  onClick={() => { setActiveCardId('hardware'); setActiveDetail(hwPills[0].desc); }}
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 800, color: 'var(--primary-main)' }}>
                    🛠️ Physical Hardware
                  </Typography>
                  <div className="system-item-list">
                    {hwPills.map(p => (
                      <div 
                        key={p.id}
                        className={`system-item-pill ${activeDetail === p.desc ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveCardId('hardware'); setActiveDetail(p.desc); }}
                      >
                        ➔ {p.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Software */}
                <div 
                  className={`system-column-card ${activeCardId === 'software' ? 'active' : ''}`}
                  onClick={() => { setActiveCardId('software'); setActiveDetail(swPills[0].desc); }}
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 800, color: 'var(--success-main)' }}>
                    💿 System & App Software
                  </Typography>
                  <div className="system-item-list">
                    {swPills.map(p => (
                      <div 
                        key={p.id}
                        className={`system-item-pill ${activeDetail === p.desc ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveCardId('software'); setActiveDetail(p.desc); }}
                      >
                        ➔ {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeDetail && (
                <Box className="details-explanation-box">
                  <Typography variant="body2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '4px' }}>
                    Component Insight:
                  </Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {activeDetail}
                  </Typography>
                </Box>
              )}

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '16px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 5. Interactive Program Design Phases flowchart
        if (src.includes('program_design_phases')) {
          const phases = [
            {
              id: 'solving',
              title: 'Phase 1: Problem-Solving Phase',
              color: 'var(--primary-main)',
              steps: [
                { s: '1. Problem Definition', d: 'Clearly describe what inputs are provided, what formatting is expected, and what outputs are required.' },
                { s: '2. Algorithm Design', d: 'Draft a logical, step-by-step roadmap to solve the problem (using structured pseudocode or flowcharts).' },
                { s: '3. Desktop Tracing & Testing', d: 'Manually trace the designed algorithm step-by-step on paper using various mock inputs to verify its logic before coding.' }
              ]
            },
            {
              id: 'implementing',
              title: 'Phase 2: Implementation Phase',
              color: 'var(--success-main)',
              steps: [
                { s: '1. Translate to Code (C++)', d: 'Convert the verified paper algorithm into formal, syntactically correct C++ code.' },
                { s: '2. Compilation', d: 'Run the written code through a compiler (like g++) to locate syntax errors and assemble standard binary machine instructions.' },
                { s: '3. Execution & Testing', d: 'Execute the machine-level binary with boundary test cases to search for runtime issues or logical bugs.' }
              ]
            }
          ];

          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Interactive Software Design Lifecycle
              </Typography>
              <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Select a software lifecycle phase below to trace its engineering steps!
              </Typography>

              <div className="visual-tab-header">
                {phases.map((p, pIdx) => (
                  <button
                    key={p.id}
                    className={`visual-tab-btn ${activeTab === pIdx ? 'active' : ''}`}
                    onClick={() => { setActiveTab(pIdx); setActiveDetail(''); }}
                  >
                    {p.title.split(':')[0]}
                  </button>
                ))}
              </div>

              <Typography variant="subtitle2" style={{ fontWeight: 800, color: phases[activeTab].color, marginBottom: '12px' }}>
                {phases[activeTab].title}
              </Typography>

              <div className="chevron-flow-container">
                {phases[activeTab].steps.map((st, sIdx) => (
                  <div 
                    key={sIdx}
                    className={`chevron-flow-step ${activeDetail === st.d ? 'active' : ''}`}
                    onClick={() => setActiveDetail(st.d)}
                  >
                    <div className="step-number">{sIdx + 1}</div>
                    <div>
                      <Typography variant="body2" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        {st.s}
                      </Typography>
                      <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                        Click to view details
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>

              {activeDetail && (
                <Box className="details-explanation-box" style={{ borderLeft: `4px solid ${phases[activeTab].color}` }}>
                  <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {activeDetail}
                  </Typography>
                </Box>
              )}

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '16px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 6. Interactive Hello World line breakdown
        if (src.includes('hello_world_full')) {
          const lines = [
            { code: '#include <iostream>', desc: 'PREPROCESSOR DIRECTIVE: Instructs the compiler to copy the contents of the standard iostream header file here, providing access to input/output streams like cout and cin.' },
            { code: 'using namespace std;', desc: 'NAMESPACE DECLARATION: Directs the compiler that we are working inside the standard std namespace. Permits omitting the std:: prefix when utilizing cout, cin, or endl.' },
            { code: 'int main()', desc: 'MAIN ENTRY POINT: The primary starting block of every C++ execution. The runtime environment seeks this function immediately, executing its internal code first.' },
            { code: '{', desc: 'BODY BLOCK BOUNDARY: Opening brace. Marks the literal initialization of the main function body.' },
            { code: '    cout << "Hello World!";', desc: 'STANDARD OUTPUT: Prints the literal text stream characters inside the double quotes onto the standard output console. The insertion operators << direct the string data towards the output terminal.' },
            { code: '    return 0;', desc: 'RETURN STATEMENT: Terminates the execution of the main block, sending exit status code 0 back to the parent operating system (conventionally signaling total success).' },
            { code: '}', desc: 'BODY BLOCK BOUNDARY: Closing brace. Marks the absolute termination of the main function.' }
          ];

          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Line-by-Line Interactive: hello_world.cpp
              </Typography>
              <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Tap any line of C++ code below to dissect its syntax and role!
              </Typography>

              <div style={{ background: 'var(--code-bg)', border: '1px solid var(--code-border)', borderRadius: '16px', padding: '12px', marginBottom: '16px' }}>
                {lines.map((ln, lIdx) => (
                  <div
                    key={lIdx}
                    className={`hello-world-line-interactive ${activeCardId === lIdx ? 'active' : ''}`}
                    onClick={() => { setActiveCardId(lIdx); setActiveDetail(ln.desc); }}
                  >
                    <div className="hello-world-line-num">{lIdx + 1}</div>
                    <div className="hello-world-line-code" style={{ color: activeCardId === lIdx ? '#1cb0f6' : 'var(--code-text-default)' }}>
                      {ln.code}
                    </div>
                  </div>
                ))}
              </div>

              {activeDetail ? (
                <Box className="details-explanation-box" style={{ borderLeft: '4px solid var(--primary-main)' }}>
                  <Typography variant="body2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '4px' }}>
                    Line {Number(activeCardId) + 1} Syntax Analysis:
                  </Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {activeDetail}
                  </Typography>
                </Box>
              ) : (
                <Box style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                    💡 Tap a C++ line to view detailed syntax glossary explanation
                  </Typography>
                </Box>
              )}

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '14px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 7. Interactive without namespace comparison
        if (src.includes('without_namespace')) {
          const comparisons = [
            {
              title: "Standard With Namespace std",
              code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!";\n    return 0;\n}`,
              desc: "By declaring 'using namespace std;', the standard library symbols (like cout, cin, endl) are loaded into the global scope. We can write cout directly, making code faster to type."
            },
            {
              title: "Explicit Without Namespace std",
              code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello World!";\n    return 0;\n}`,
              desc: "Without the namespace declaration, C++ compiler does not know what 'cout' refers to. We must prefix it with 'std::' (Scope Resolution Operator) to explicitly fetch cout from the standard library namespace."
            }
          ];

          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Scope Resolution Comparison: std:: namespace
              </Typography>
              <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Toggle tabs below to see how namespaces affect output code syntax!
              </Typography>

              <div className="visual-tab-header">
                {comparisons.map((c, cIdx) => (
                  <button
                    key={cIdx}
                    className={`visual-tab-btn ${activeTab === cIdx ? 'active' : ''}`}
                    onClick={() => setActiveTab(cIdx)}
                  >
                    {cIdx === 0 ? "With std" : "Without std"}
                  </button>
                ))}
              </div>

              <div style={{ background: 'var(--code-bg)', border: '1px solid var(--code-border)', borderRadius: '16px', padding: '16px', marginBottom: '16px', textAlign: 'left' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', color: 'var(--code-text-default)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {comparisons[activeTab].code.split('\n').map((line, lIdx) => (
                    <div key={lIdx}>
                      <span style={{ color: 'var(--code-line-num)', marginRight: '12px' }}>{lIdx + 1}</span>
                      <span>
                        {line.includes('std::') ? (
                          <>
                            {line.split('std::')[0]}
                            <span style={{ color: 'var(--orange-500)', fontWeight: 800 }}>std::</span>
                            {line.split('std::')[1]}
                          </>
                        ) : line.includes('namespace') ? (
                          <span style={{ color: 'var(--primary-main)', fontWeight: 650 }}>{line}</span>
                        ) : line}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>

              <Box className="details-explanation-box" style={{ borderLeft: '4px solid var(--primary-main)' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '4px' }}>
                  {comparisons[activeTab].title}
                </Typography>
                <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {comparisons[activeTab].desc}
                </Typography>
              </Box>

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '14px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 8. Interactive cout no newline console simulator
        if (src.includes('cout_no_newline')) {
          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Console Buffer Simulation: No Newline
              </Typography>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '16px 0' }}>
                {/* Code segment */}
                <div style={{ background: 'var(--code-bg)', border: '1px solid var(--code-border)', borderRadius: '16px', padding: '16px', textAlign: 'left' }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', color: 'var(--code-text-default)', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--code-line-num)' }}>// Statement A - Output first string</div>
                    cout &lt;&lt; <span style={{ color: '#CE9178' }}>"Hello World!"</span>;{"\n\n"}
                    <div style={{ color: 'var(--code-line-num)' }}>// Statement B - Output second string directly after</div>
                    cout &lt;&lt; <span style={{ color: '#CE9178' }}>"I am learning C++"</span>;
                  </pre>
                </div>

                {/* Animated Terminal */}
                <div>
                  <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '6px', textAlign: 'left' }}>
                    💻 SCREEN DISPLAY BUFFER
                  </Typography>
                  <div style={{ background: '#0f1424', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#66bb6a', position: 'relative', textAlign: 'left', minHeight: '52px' }}>
                    Hello World!I am learning C++<span className="terminal-cursor" style={{ background: '#66bb6a', width: '8px', height: '15px', display: 'inline-block', marginLeft: '4px', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
                  </div>
                </div>
              </div>

              <Box className="details-explanation-box" style={{ borderLeft: '4px solid var(--success-main)' }}>
                <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>Key Discovery:</strong> C++ stream outputs are sequential and contiguous! Because neither statement injected a newline operator (such as <code>endl</code> or <code>\n</code>), Statement B appends its string exactly where Statement A left off, yielding zero whitespace between them.
                </Typography>
              </Box>

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '14px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 9. Interactive newline examples tabbed switcher
        if (src.includes('newline_examples')) {
          const tabData = [
            {
              title: "\\n Escape Sequence",
              code: 'cout << "Hello\\nWorld!";',
              terminal: "Hello\nWorld!_",
              desc: "\\n is an Escape Character. When encountered in a string literal, the console runtime jumps immediately to the beginning of the next row."
            },
            {
              title: "endl Stream Manipulator",
              code: 'cout << "Hello" << endl << "World!";',
              terminal: "Hello\nWorld!_",
              desc: "endl is a Stream Manipulator. It writes a newline character to the stream AND instantly flushes the output buffer, writing data immediately to the screen."
            },
            {
              title: "Double Newline \\n\\n",
              code: 'cout << "Hello\\n\\nWorld!";',
              terminal: "Hello\n\nWorld!_",
              desc: "Injecting double newlines creates a beautiful blank line separation, which is excellent for building structured, readable output layouts."
            }
          ];

          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Interactive Console: Newline Operators
              </Typography>
              <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Toggle tabs below to explore different ways to break lines!
              </Typography>

              <div className="visual-tab-header">
                {tabData.map((t, idxT) => (
                  <button
                    key={idxT}
                    className={`visual-tab-btn ${activeTab === idxT ? 'active' : ''}`}
                    onClick={() => setActiveTab(idxT)}
                  >
                    {idxT === 0 ? "\\n" : idxT === 1 ? "endl" : "\\n\\n"}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div style={{ background: 'var(--code-bg)', border: '1px solid var(--code-border)', borderRadius: '16px', padding: '14px' }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', color: 'var(--code-text-default)', fontSize: '0.85rem' }}>
                    cout &lt;&lt; <span style={{ color: '#CE9178' }}>
                      {tabData[activeTab].code.includes('\\n\\n') ? '"Hello\\n\\nWorld!"' : tabData[activeTab].code.includes('\\n') ? '"Hello\\nWorld!"' : '"Hello" << endl << "World!"'}
                    </span>;
                  </pre>
                </div>

                <div>
                  <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '6px' }}>
                    💻 OUTPUT DISPLAY SCREEN
                  </Typography>
                  <div style={{ background: '#0f1424', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#66bb6a', whiteSpace: 'pre-wrap', minHeight: '80px' }}>
                    {tabData[activeTab].terminal.split('_')[0]}
                    <span className="terminal-cursor" style={{ background: '#66bb6a', width: '8px', height: '15px', display: 'inline-block', marginLeft: '4px', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
                  </div>
                </div>
              </div>

              <Box className="details-explanation-box" style={{ borderLeft: '4px solid var(--primary-main)' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '4px' }}>
                  {tabData[activeTab].title}
                </Typography>
                <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {tabData[activeTab].desc}
                </Typography>
              </Box>

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '14px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 10. Interactive Local Area Network (LAN) Topology Map
        if (src.includes('lan_diagram')) {
          const lanDevices = [
            { id: 'internet', label: 'Internet', icon: '🌐', desc: 'The Global WAN. Source of external data, web services, and global routing connections.' },
            { id: 'modem', label: 'Modem', icon: '🎛️', desc: 'The Translator. Modulates/demodulates analog signals from the ISP line (fiber/cable/DSL) into digital Ethernet.' },
            { id: 'router', label: 'Router (Wi-Fi)', icon: '📶', desc: 'The Network Traffic Cop. Routes local packages, assigns local IPs (DHCP), implements local firewall protections, and broadcasts local Wi-Fi.' },
            { id: 'desktop', label: 'Wired PC', icon: '🖥️', desc: 'Ethernet client. Enjoying robust high-bandwidth, minimal interference, and ultra-low latency wiring directly connected to the router.' },
            { id: 'smartphone', label: 'Mobile Phone', icon: '📱', desc: 'Wireless client. Connected over radio waves via Wi-Fi standard protocols. Moves freely across local space.' },
            { id: 'printer', label: 'Shared Printer', icon: '🖨️', desc: 'Shared LAN Node resource. Accessible by both wired and wireless clients on the same local subnet.' }
          ];

          return (
            <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', textAlign: 'center', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Interactive LAN Topology Diagram
              </Typography>
              <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Click any local node in the LAN network structure below to explore its utility!
              </Typography>

              <div className="lan-topology-board">
                <div className="lan-connector-line" />
                <div className="lan-nodes-grid">
                  {lanDevices.map(d => (
                    <div
                      key={d.id}
                      className={`lan-node ${activeCardId === d.id ? 'active' : ''}`}
                      onClick={() => { setActiveCardId(d.id); setActiveDetail(d.desc); }}
                    >
                      <div className="lan-node-icon-wrapper" style={{ fontSize: '1.5rem' }}>
                        {d.icon}
                      </div>
                      <Typography variant="caption" style={{ fontWeight: 800, fontSize: '0.72rem', color: '#fff' }}>
                        {d.label}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              {activeDetail ? (
                <Box className="details-explanation-box" style={{ borderLeft: '4px solid var(--success-main)' }}>
                  <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--success-main)', marginBottom: '4px' }}>
                    {lanDevices.find(d => d.id === activeCardId)?.label} Node Function:
                  </Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {activeDetail}
                  </Typography>
                </Box>
              ) : (
                <Box style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                    💡 Tap any router client or network link to explore LAN device capabilities
                  </Typography>
                </Box>
              )}

              {alt && (
                <Typography variant="caption" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '14px' }}>
                  Figure: {alt}
                </Typography>
              )}
            </Paper>
          );
        }

        // 11. Cyber Security Threats, Teams, & Defense flow simulator (For Cybersecurity Courses)
        if (src.includes('security') || src.includes('opsec') || src.includes('threat') || src.includes('ransomware') || src.includes('engineering') || src.includes('insider') || src.includes('apt') || src.includes('actors') || src.includes('team')) {
          const conceptTitle = src ? src.replace(/_|-/g, ' ').replace('.png', '') : 'Cybersecurity Domain';
          
          let mitigations = [
            { id: 'm1', text: 'Apply Multi-Factor Authentication (MFA) & Zero Trust policies', correct: true, feedback: 'Correct! Implementing strict identity verification and least-privilege isolates access vectors entirely.' },
            { id: 'm2', text: 'Deploy Air-Gapped Immutable Backups', correct: false, feedback: 'Useful for recovering from ransomware, but this is a secondary response. We need to prevent the initial penetration vector first.' },
            { id: 'm3', text: 'Run Firewalls and Anti-Virus Scans only', correct: false, feedback: 'Insufficient! Legacy static firewalls are easily bypassed by modern social engineering or insider access.' }
          ];

          if (src.includes('ransomware')) {
            mitigations = [
              { id: 'r1', text: 'Enforce Immutable, Air-Gapped Backups & Segment Networks', correct: true, feedback: 'Correct! Isolated air-gapped backups ensure you can restore without paying ransoms, and segmenting prevents lateral movement.' },
              { id: 'r2', text: 'Pay the ransom immediately', correct: false, feedback: 'Wrong! Paying does not guarantee key retrieval, and funds future attacks.' },
              { id: 'r3', text: 'Block standard USB drives', correct: false, feedback: 'Partially helpful, but does not block primary email phishing delivery routes.' }
            ];
          } else if (src.includes('insider')) {
            mitigations = [
              { id: 'i1', text: 'Least-Privilege Role Access Controls & Continuous Logging', correct: true, feedback: 'Correct! Least privilege minimizes what database rows an insider can access, and logs reveal abnormal bulk exfiltrations.' },
              { id: 'i2', text: 'Deploy standard network firewalls', correct: false, feedback: 'Useless! Insiders already bypass peripheral firewalls because they have legitimate network badges.' },
              { id: 'i3', text: 'Force weekly password updates', correct: false, feedback: 'Ineffective! Password cycling does not stop malicious employees using their own active credentials.' }
            ];
          } else if (src.includes('team')) {
            mitigations = [
              { id: 't1', text: 'Conduct collaborative feedback loops (Purple Teaming)', correct: true, feedback: 'Correct! Purple Teaming integrates offensive testing directly with defensive logging and alert calibration for instant patches.' },
              { id: 't2', text: 'Keep offensive results classified from defenders', correct: false, feedback: 'Wrong! Withholding exploit details leaves defenders in the dark, leaving the vulnerability open.' },
              { id: 't3', text: 'Run vulnerability scanners annually', correct: false, feedback: 'Legacy! Vulnerability scans only find known static bugs, skipping active posture testing.' }
            ];
          }

          const triggerThreatSimulation = () => {
            setSimulatedSecurityStatus('breached');
            setSimulatedLog(`[CRITICAL WARNING] Simulated exploit triggered via: ${conceptTitle.toUpperCase()}\n[ALERT] Lateral penetration attempting system takeover...\n[ACTION REQUIRED] Select the optimal active security mitigation below!`);
          };

          const handleMitigate = (item) => {
            if (item.correct) {
              setSimulatedSecurityStatus('mitigated');
              setSimulatedLog(`[INFO] Mitigation deployed: ${item.text.substring(0, 35)}...\n[SUCCESS] Penetration vectors blocked, database systems isolated.\n[SECURITY LEVEL] Green - Secure and fully patched!`);
            } else {
              setSimulatedLog(prev => `${prev}\n[CRITICAL FAILURE] Deploying: "${item.text.substring(0, 20)}..." failed to resolve threat! Attempting escalation...`);
            }
          };

          return (
            <Paper key={idx} className="security-simulator-card" elevation={0}>
              <div className="security-glass-shimmer" />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', textAlign: 'left' }}>
                <div>
                  <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#fff', textTransform: 'capitalize', fontSize: '1rem' }}>
                    {conceptTitle} Concept Simulator
                  </Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                    Cybersecurity Interactive Posture Lab
                  </Typography>
                </div>
                
                <Box style={{ 
                  padding: '6px 14px', 
                  borderRadius: '12px', 
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  backgroundColor: 
                    simulatedSecurityStatus === 'secure' ? 'rgba(76, 175, 80, 0.15)' : 
                    simulatedSecurityStatus === 'breached' ? 'rgba(239, 83, 80, 0.15)' : 
                    'rgba(41, 182, 246, 0.15)',
                  color: 
                    simulatedSecurityStatus === 'secure' ? '#66bb6a' : 
                    simulatedSecurityStatus === 'breached' ? '#ef5350' : 
                    '#29b6f6',
                  border: `1.5px solid ${
                    simulatedSecurityStatus === 'secure' ? '#66bb6a' : 
                    simulatedSecurityStatus === 'breached' ? '#ef5350' : 
                    '#29b6f6'
                  }`
                }}>
                  {simulatedSecurityStatus === 'secure' ? '🛡️ SECURE' : simulatedSecurityStatus === 'breached' ? '⚠️ EXPLOITED' : '✅ PATCHED'}
                </Box>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
                <Typography variant="body2" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Subject Area:</strong> {alt || "Exposes potential vulnerabilities and outlines secure architecture steps to preserve integrity."}
                </Typography>
              </div>

              {simulatedSecurityStatus === 'secure' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
                  <Button 
                    variant="contained" 
                    className="security-sim-btn" 
                    style={{ background: 'var(--danger-main)'}}
                    onClick={triggerThreatSimulation}
                  >
                    Simulate Active Attack Vector
                  </Button>
                </div>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  <Typography variant="caption" style={{ fontWeight: 800, color: '#fff', display: 'block', marginBottom: '8px' }}>
                    SELECT DEFENSIVE ACTION:
                  </Typography>
                  <div>
                    {mitigations.map((item) => (
                      <div 
                        key={item.id}
                        className={`security-choice-chip ${simulatedSecurityStatus === 'mitigated' && item.correct ? 'correct' : ''}`}
                        onClick={() => simulatedSecurityStatus !== 'mitigated' && handleMitigate(item)}
                      >
                        <span>{item.text}</span>
                        {simulatedSecurityStatus === 'mitigated' && item.correct && <span>✓ Verified</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {simulatedLog && (
                <div className="security-term-console">
                  {simulatedLog.split('\n').map((line, logIdx) => {
                    let type = 'info';
                    if (line.includes('[CRITICAL')) type = 'danger';
                    else if (line.includes('[ALERT') || line.includes('[WARN')) type = 'warn';
                    else if (line.includes('[SUCCESS')) type = 'success';
                    return (
                      <p key={logIdx} className={`security-console-line ${type}`}>
                        {line}
                      </p>
                    );
                  })}
                </div>
              )}
            </Paper>
          );
        }

        // 12. Default Interactive Concept Reference Schema Cards
        return (
          <Paper key={idx} className="slide-image-card glass-panel" elevation={0} style={{ padding: '24px', margin: '20px 0', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
            <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--hero-gradient)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <Box style={{ display: 'grid', placeItems: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(28,176,246,0.1)', border: '1px solid rgba(28,176,246,0.2)', flexShrink: 0 }}>
                {src.includes('security') || src.includes('opsec') || src.includes('threat') ? (
                  <SuccessIcon style={{ color: 'var(--primary-main)', fontSize: '24px' }} />
                ) : (
                  <BookIcon style={{ color: 'var(--primary-main)', fontSize: '24px' }} />
                )}
              </Box>
              <div style={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {src ? src.replace(/_|-/g, ' ').replace('.png', '') : 'Visual Diagram'}
                </Typography>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  Interactive Concept Reference Schema
                </Typography>
              </div>
            </div>
            
            <Box style={{ padding: '14px', background: 'rgba(0,0,0,0.16)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '8px' }}>
              <Typography variant="body2" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, textAlign: 'left' }}>
                {alt || "Concept visual reference illustration."}
              </Typography>
            </Box>
          </Paper>
        );
      }

      default:
        return (
          <Box key={idx} className="slide-block-default glass-panel">
            <Typography variant="body2">{block.text || JSON.stringify(block)}</Typography>
          </Box>
        );

    }
  };

  if (isLoading) {
    const logoStyle = localStorage.getItem('sophiapath_logo_style') || 'split';
    return (
      <Box className="learning-content-loader">
        <div 
          className={`sp-loader-logo-container ${logoStyle === 'gradient' ? 'sp-logo-gradient' : ''}`}
          style={{
            WebkitMaskImage: `url(${logoImg})`,
            maskImage: `url(${logoImg})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain'
          }}
        >
          <div className="sp-splash-logo-left" />
          <div className="sp-splash-logo-right" />
        </div>
        <Typography className="sp-loader-quote">
          {activeQuote}
        </Typography>
        <div className="sp-loading-dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box className="learning-content-empty">
        <Typography variant="h5" gutterBottom>Lesson not found</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const hasVulnerabilityChallenge = !!(currentPage && currentPage.blocks && currentPage.blocks.some(b => b.type === 'vulnerability_challenge'));

  return (
    <Box className="learning-content-page">
      <header className="learning-content-header glass-panel">
        <Container maxWidth="lg" className="learning-header-content">
          <div className="learning-header-left">
            <IconButton onClick={() => navigate(-1)} className="learning-back-btn">
              <ArrowBackIcon />
            </IconButton>
            <div>
              <Typography variant="h6" className="learning-lesson-title">
                {lesson.title}
              </Typography>
              <Typography variant="caption" className="learning-progress-text">
                Slide {currentPageIndex + 1} of {pages.length}
              </Typography>
            </div>
          </div>
          {lesson.title.toLowerCase().includes('cheatsheet') && (
            <Button
              variant="contained"
              onClick={handleDownloadCheatsheet}
              startIcon={<DownloadIcon />}
              style={{
                marginRight: '12px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                textTransform: 'none',
                background: 'var(--hero-gradient)',
                color: '#fff',
                fontFamily: '"Outfit", sans-serif'}}
            >
              Download
            </Button>
          )}
          <IconButton onClick={() => {
            const originalCourseId = location.state?.course?.id || courseId;
            navigate(`/learning-path/${originalCourseId}`, { state: location.state });
          }} className="learning-close-btn">
            <CloseIcon />
          </IconButton>
        </Container>
        <LinearProgress
          variant="determinate"
          value={progress}
          className="learning-progress-bar"
        />
      </header>

      <Container maxWidth={false} style={hasVulnerabilityChallenge ? { maxWidth: '1240px' } : { maxWidth: '900px' }} className="learning-slide-deck">
        <AnimatePresence mode="wait">
          {currentPage && (
            <motion.div
              key={currentPageIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={`learning-slide-container ${hasVulnerabilityChallenge ? 'wider' : ''}`}
            >
              <Paper className="learning-slide-paper glass-panel-strong" elevation={0}>
                {currentPage.pageTitle && (
                  <Typography variant="h4" className="slide-page-title" gutterBottom>
                    {currentPage.pageTitle}
                  </Typography>
                )}
                <div className="slide-blocks-list">
                  {currentPage.blocks?.map((block, idx) => renderBlock(block, idx))}
                </div>
                {pages.length === 1 && (!currentPage?.blocks?.some(b => b.type === 'vulnerability_challenge') || isPageCompleted(currentPageIndex)) && (
                  <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <Button
                      variant="contained"
                      onClick={handleFinish}
                      disabled={!isPageCompleted(currentPageIndex)}
                      style={{
                        background: 'var(--hero-gradient)',
                        color: '#fff',
                        fontWeight: 800,
                        padding: '12px 28px',
                        borderRadius: '12px',
                        border: 'none',
                        textTransform: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      Finish Lesson
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {pages.length > 1 && (portalElement ? createPortal(
        <footer className="learning-content-footer glass-panel">
          <Container maxWidth="md" className="learning-footer-content">
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentPageIndex === 0}
              startIcon={<LeftIcon />}
              className="footer-nav-btn"
            >
              Previous
            </Button>
            {currentPageIndex === pages.length - 1 ? (
              (!currentPage?.blocks?.some(b => b.type === 'vulnerability_challenge') || isPageCompleted(currentPageIndex)) && (
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={!isPageCompleted(currentPageIndex)}
                  endIcon={<RightIcon />}
                  className="footer-nav-btn"
                >
                  Finish Lesson
                </Button>
              )
            ) : (
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={!isPageCompleted(currentPageIndex)}
                endIcon={<RightIcon />}
                className="footer-nav-btn"
              >
                Next
              </Button>
            )}
          </Container>
        </footer>,
        portalElement
      ) : (
        <footer className="learning-content-footer glass-panel">
          <Container maxWidth="md" className="learning-footer-content">
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentPageIndex === 0}
              startIcon={<LeftIcon />}
              className="footer-nav-btn"
            >
              Previous
            </Button>
            {currentPageIndex === pages.length - 1 ? (
              (!currentPage?.blocks?.some(b => b.type === 'vulnerability_challenge') || isPageCompleted(currentPageIndex)) && (
                <Button
                  variant="outlined"
                  onClick={handleNext}
                  disabled={!isPageCompleted(currentPageIndex)}
                  endIcon={<RightIcon />}
                  className="footer-nav-btn"
                >
                  Finish Lesson
                </Button>
              )
            ) : (
              <Button
                variant="outlined"
                onClick={handleNext}
                disabled={!isPageCompleted(currentPageIndex)}
                endIcon={<RightIcon />}
                className="footer-nav-btn"
              >
                Next
              </Button>
            )}
          </Container>
        </footer>
      ))}

      <CppPlaygroundDialog
        open={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
        initialCode={compilerInitialCode}
      />

      {selectedChallenge && (
        <ChallengePlaygroundDialog
          open={isChallengeOpen}
          onClose={() => setIsChallengeOpen(false)}
          challenge={selectedChallenge}
          isDarkMode={isDarkMode}
          onSolved={() => {
            const key = _blockKey(currentPageIndex, selectedChallengeBlockIdx);
            setExerciseAnswers(prev => ({ ...prev, [key]: true }));
          }}
        />
      )}

      {isExportingPdf && (
        <div 
          id="cheatsheet-pdf-export-container" 
          style={{ 
            position: 'fixed', 
            left: '-9999px', 
            top: '-9999px', 
            zIndex: -9999, 
            width: '800px', 
            backgroundColor: 'var(--background-default)', 
            color: 'var(--text-primary)',
            padding: '40px',
            boxSizing: 'border-box'
          }}
        >
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 800, borderBottom: '2px solid var(--primary-main)', paddingBottom: '12px', marginBottom: '30px' }}>
            {lesson.title} - Cheatsheet
          </h1>
          {pages.map((page, pIdx) => (
            <div 
              key={pIdx} 
              className="cheatsheet-pdf-export-slide"
              style={{ 
                backgroundColor: 'var(--background-paper)', 
                border: '1px solid var(--divider)', 
                borderRadius: '16px', 
                padding: '40px', 
                marginBottom: '30px'}}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-main)', marginTop: 0, marginBottom: '20px' }}>
                {page.pageTitle || `Section ${pIdx + 1}`}
              </h2>
              <div className="slide-blocks-list">
                {page.blocks?.map((block, idx) => (
                  <div key={idx} className="cheatsheet-pdf-block" style={{ marginBottom: '16px' }}>
                    {renderBlock(block, idx)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog 
        open={isExportingPdf} 
        PaperProps={{ 
          style: { 
            padding: '24px', 
            borderRadius: '16px', 
            background: 'var(--background-paper)', 
            border: '1px solid var(--divider)', 
            color: 'var(--text-primary)', 
            textAlign: 'center' 
          } 
        }}
      >
        <DialogContent>
          <Typography variant="h6" style={{ fontWeight: 800, marginBottom: '8px', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
            Generating Cheatsheet PDF
          </Typography>
          <Typography variant="body2" style={{ opacity: 0.8, marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Taking high-definition screenshots of your lesson slides...
          </Typography>
          <LinearProgress color="primary" />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LearningContentPage;
