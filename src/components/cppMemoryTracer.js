/**
 * C++ Memory Tracer & Step-by-Step Execution Engine
 * Clean, unified data model with scope tracking, creation flags, and persistent value change history.
 */

const BASE_STACK_ADDR = 0x7ffd98a0;
const BASE_HEAP_ADDR = 0x55a8e010;

const TYPE_SIZES = {
  int: 4,
  float: 4,
  double: 8,
  bool: 1,
  char: 1,
  string: 32,
  pointer: 8,
  auto: 4,
};

export const traceCppExecution = (cppCode, inputs = []) => {
  const steps = [];
  const lines = cppCode.split('\n');
  
  // Unified memory maps (key: scope::name or address)
  const stackEntries = new Map(); // key -> { name, scope, type, value, prevValue, history: [], hasChanged, isCreated, isUpdated, address, size, isPointer, targetName, targetValue, isArray, elements }
  const heapBlocks = new Map();   // address -> { address, type, value, size, label, isCreated }
  
  let currentStackOffset = 0;
  let currentHeapOffset = 0;
  let accumulatedStdout = '';
  let inputIndex = 0;
  let activeScope = 'main()';

  const allocateStackAddress = (size = 4) => {
    const addr = (BASE_STACK_ADDR - currentStackOffset).toString(16).toUpperCase();
    currentStackOffset += size;
    return `0x${addr}`;
  };

  const allocateHeapAddress = (size = 4) => {
    const addr = (BASE_HEAP_ADDR + currentHeapOffset).toString(16).toUpperCase();
    currentHeapOffset += size;
    return `0x${addr}`;
  };

  const createSnapshot = (lineNum, stmt) => {
    const stackSnapshot = Array.from(stackEntries.values()).map(entry => {
      if (entry.isArray && entry.elements) {
        return {
          ...entry,
          history: [...(entry.history || [])],
          elements: entry.elements.map(el => ({
            ...el,
            history: [...(el.history || [])]
          }))
        };
      }
      return {
        ...entry,
        history: [...(entry.history || [])]
      };
    });

    const heapSnapshot = Array.from(heapBlocks.values()).map(h => ({ ...h }));

    steps.push({
      stepIndex: steps.length,
      lineNumber: lineNum,
      statement: stmt.trim(),
      activeScope: activeScope,
      stack: stackSnapshot,
      heap: heapSnapshot,
      stdout: accumulatedStdout
    });

    // Reset single-step pulse update flags after snapshot
    stackEntries.forEach(v => {
      v.isCreated = false;
      v.isUpdated = false;
      if (v.isArray && v.elements) {
        v.elements.forEach(el => {
          el.isCreated = false;
          el.isUpdated = false;
        });
      }
    });
  };

  // Parse user-defined helper functions (anywhere in file, before or after main)
  const functionDefs = new Map();
  let currentFuncParsing = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip forward declarations ending with ';'
    if (trimmed.endsWith(';') && !trimmed.startsWith('return')) {
      continue;
    }

    const funcMatch = /^(void|int|double|float|bool|string|char)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{?/.exec(trimmed);
    if (funcMatch && funcMatch[2] !== 'main') {
      const funcName = funcMatch[2];
      const params = funcMatch[3].split(',').map(p => p.trim()).filter(Boolean).map(p => {
        const pParts = p.split(/\s+/);
        return { type: pParts[0], name: pParts[1]?.replace('&', '') || 'param', isRef: p.includes('&') };
      });
      currentFuncParsing = {
        name: funcName,
        returnType: funcMatch[1],
        params,
        startLine: i + 1,
        lines: []
      };
      functionDefs.set(funcName, currentFuncParsing);
      continue;
    }

    if (currentFuncParsing) {
      if (trimmed === '}') {
        currentFuncParsing = null;
      } else if (trimmed && !trimmed.startsWith('//')) {
        currentFuncParsing.lines.push({ lineNum: i + 1, code: trimmed });
      }
      continue;
    }
  }

  // Expression evaluator
  const evaluateExpr = (exprStr) => {
    if (!exprStr) return 0;
    let expr = String(exprStr).trim();
    
    if (expr === 'true') return true;
    if (expr === 'false') return false;

    if (/^'(.|\\.)'$/.test(expr)) return expr.slice(1, -1);
    if (/^"([^"\\]|\\.)*"$/.test(expr)) return expr.slice(1, -1);

    let evalString = expr;

    // Evaluate user-defined function calls inside expression: e.g. test(x)
    functionDefs.forEach((funcDef, funcName) => {
      const callRegex = new RegExp(`\\b${funcName}\\s*\\(([^)]*)\\)`, 'g');
      evalString = evalString.replace(callRegex, (fullCall, rawArgs) => {
        const argStrings = rawArgs.split(',').map(a => a.trim()).filter(Boolean);
        const callerScope = activeScope;
        activeScope = `${funcName}()`;

        createSnapshot(funcDef.startLine, `${funcDef.returnType} ${funcName}(${rawArgs})`);

        funcDef.params.forEach((param, pIdx) => {
          const argStr = argStrings[pIdx];
          const argVal = evaluateExpr(argStr);
          const pKey = `${activeScope}::${param.name}`;
          const pAddr = allocateStackAddress(TYPE_SIZES[param.type] || 4);

          stackEntries.set(pKey, {
            name: param.name,
            scope: activeScope,
            type: param.type,
            value: argVal,
            prevValue: null,
            history: [],
            hasChanged: false,
            isCreated: true,
            address: pAddr,
            size: TYPE_SIZES[param.type] || 4,
            isUpdated: true,
            isParam: true
          });
        });

        createSnapshot(funcDef.startLine, `Entered function ${activeScope}`);

        let returnVal = 0;
        for (const fStmt of funcDef.lines) {
          if (fStmt.code.startsWith('return')) {
            const retExpr = fStmt.code.replace(/^return\s*/, '').replace(/;$/, '').trim();
            returnVal = retExpr ? evaluateExpr(retExpr) : 0;
            createSnapshot(fStmt.lineNum, fStmt.code);
            break;
          }
          executeStatement(fStmt.lineNum, fStmt.code);
        }

        createSnapshot(funcDef.startLine, `Returned from ${activeScope} to ${callerScope}`);
        activeScope = callerScope;
        return JSON.stringify(returnVal);
      });
    });

    // Array index access
    evalString = evalString.replace(/([a-zA-Z_]\w*)\[([^\]]+)\]/g, (match, arrName, idxExpr) => {
      const arr = stackEntries.get(`${activeScope}::${arrName}`) || stackEntries.get(`main()::${arrName}`);
      if (arr && arr.isArray && arr.elements) {
        const idx = evaluateExpr(idxExpr);
        if (arr.elements[idx]) {
          return JSON.stringify(arr.elements[idx].value);
        }
      }
      return '0';
    });

    // Pointer dereference *p
    evalString = evalString.replace(/\*([a-zA-Z_]\w*)/g, (match, ptrName) => {
      const ptr = stackEntries.get(`${activeScope}::${ptrName}`) || stackEntries.get(`main()::${ptrName}`);
      if (ptr && ptr.isPointer) {
        if (ptr.targetName) {
          const targetVar = stackEntries.get(`${activeScope}::${ptr.targetName}`) || stackEntries.get(`main()::${ptr.targetName}`);
          if (targetVar) return JSON.stringify(targetVar.value);
        }
        if (heapBlocks.has(ptr.value)) {
          return JSON.stringify(heapBlocks.get(ptr.value).value);
        }
      }
      return '0';
    });

    // Replace variable names with values
    stackEntries.forEach((v) => {
      if (v.scope === activeScope || v.scope === 'main()') {
        if (!v.isArray) {
          const regex = new RegExp(`\\b${v.name}\\b`, 'g');
          evalString = evalString.replace(regex, JSON.stringify(v.value));
        }
      }
    });

    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${evalString});`)();
      return result;
    } catch {
      return expr;
    }
  };

  // Find executable lines in main()
  let inMain = false;
  let mainStartLine = 1;
  const mainStatements = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (/int\s+main\s*\(/.test(trimmed)) {
      inMain = true;
      mainStartLine = i + 1;
      continue;
    }

    if (!inMain) continue;
    if (trimmed === '}' && inMain) break;
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed === '{') continue;

    mainStatements.push({
      lineNum: i + 1,
      code: trimmed
    });
  }

  // Initial step at main entry
  activeScope = 'main()';
  createSnapshot(mainStartLine, 'int main()');

  // Helper to execute a single statement in the active scope
  const executeStatement = (lineNum, stmt) => {
    // 1. cout << ...
    if (stmt.startsWith('cout')) {
      const parts = stmt.replace(/^cout\s*<</, '').replace(/;$/, '').split('<<').map(p => p.trim());
      let printedText = '';

      for (const part of parts) {
        if (part === 'endl' || part === '"\\n"' || part === "'\\n'") {
          printedText += '\n';
        } else {
          const val = evaluateExpr(part);
          printedText += String(val);
        }
      }

      accumulatedStdout += printedText;
      createSnapshot(lineNum, stmt);
      return;
    }

    // 2. cin >> ...
    if (stmt.startsWith('cin')) {
      const targets = stmt.replace(/^cin\s*>>/, '').replace(/;$/, '').split('>>').map(t => t.trim());
      targets.forEach(target => {
        const inputVal = inputs[inputIndex++] ?? 0;
        const key = `${activeScope}::${target}`;
        if (stackEntries.has(key)) {
          const v = stackEntries.get(key);
          const newVal = isNaN(Number(inputVal)) ? inputVal : Number(inputVal);
          if (v.value !== newVal) {
            v.history = v.history || [];
            v.history.push(v.value);
            v.prevValue = v.value;
            v.value = newVal;
            v.hasChanged = true;
            v.isUpdated = true;
          }
        }
      });
      createSnapshot(lineNum, stmt);
      return;
    }

    // 3. Helper Function Call invocation e.g. swap(x, y); or test(x);
    const callMatch = /^([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*;/.exec(stmt);
    if (callMatch && functionDefs.has(callMatch[1])) {
      const funcName = callMatch[1];
      const argStrings = callMatch[2].split(',').map(a => a.trim()).filter(Boolean);
      const funcDef = functionDefs.get(funcName);

      const callerScope = activeScope;
      activeScope = `${funcName}()`;

      createSnapshot(funcDef.startLine, `${funcDef.returnType} ${funcName}(...)`);

      funcDef.params.forEach((param, pIdx) => {
        const argStr = argStrings[pIdx];
        const argVal = evaluateExpr(argStr);
        const pKey = `${activeScope}::${param.name}`;
        const pAddr = allocateStackAddress(TYPE_SIZES[param.type] || 4);

        stackEntries.set(pKey, {
          name: param.name,
          scope: activeScope,
          type: param.type,
          value: argVal,
          prevValue: null,
          history: [],
          hasChanged: false,
          isCreated: true,
          address: pAddr,
          size: TYPE_SIZES[param.type] || 4,
          isUpdated: true,
          isParam: true
        });
      });

      createSnapshot(funcDef.startLine, `Entered function ${activeScope}`);

      for (const fStmt of funcDef.lines) {
        executeStatement(fStmt.lineNum, fStmt.code);
      }

      createSnapshot(lineNum, `Returned from ${activeScope} to ${callerScope}`);
      activeScope = callerScope;
      return;
    }

    // 4. Dynamic Heap Allocation: int* p = new int(42);
    const newMatch = /^(int|double|float|char|bool|string)\s*\*\s*([a-zA-Z_]\w*)\s*=\s*new\s+(int|double|float|char|bool|string)(\((.*)\)|\[(.*)\])?\s*;/.exec(stmt);
    if (newMatch) {
      const type = newMatch[1];
      const ptrName = newMatch[2];
      const initialValExpr = newMatch[5];
      const isArrayAlloc = Boolean(newMatch[6]);
      const initialVal = initialValExpr ? evaluateExpr(initialValExpr) : 0;
      
      const heapAddr = allocateHeapAddress(isArrayAlloc ? 20 : (TYPE_SIZES[type] || 4));
      const ptrAddr = allocateStackAddress(8);
      const key = `${activeScope}::${ptrName}`;

      heapBlocks.set(heapAddr, {
        address: heapAddr,
        type: type,
        value: initialVal,
        size: TYPE_SIZES[type] || 4,
        label: isArrayAlloc ? `new ${type}[${newMatch[6]}]` : `new ${type}(${initialVal})`,
        isCreated: true
      });

      stackEntries.set(key, {
        name: ptrName,
        scope: activeScope,
        type: `${type}*`,
        value: heapAddr,
        prevValue: null,
        history: [],
        hasChanged: false,
        isCreated: true,
        address: ptrAddr,
        size: 8,
        isPointer: true,
        targetName: null,
        targetValue: initialVal,
        isUpdated: true
      });

      createSnapshot(lineNum, stmt);
      return;
    }

    // 5. delete or delete[]
    const deleteMatch = /^delete(\[\])?\s+([a-zA-Z_]\w*)\s*;/.exec(stmt);
    if (deleteMatch) {
      const ptrName = deleteMatch[2];
      const key = `${activeScope}::${ptrName}`;
      const ptr = stackEntries.get(key);
      if (ptr && ptr.isPointer) {
        heapBlocks.delete(ptr.value);
        ptr.history = ptr.history || [];
        ptr.history.push(ptr.targetValue);
        ptr.prevValue = ptr.targetValue;
        ptr.targetValue = '<freed>';
        ptr.hasChanged = true;
        ptr.isUpdated = true;
      }
      createSnapshot(lineNum, stmt);
      return;
    }

    // 6. Pointer declaration: int* p = &x;
    const ptrDeclMatch = /^(int|double|float|char|bool|string)\s*\*\s*([a-zA-Z_]\w*)\s*=\s*&([a-zA-Z_]\w*)\s*;/.exec(stmt);
    if (ptrDeclMatch) {
      const type = ptrDeclMatch[1];
      const ptrName = ptrDeclMatch[2];
      const targetVarName = ptrDeclMatch[3];
      const targetVar = stackEntries.get(`${activeScope}::${targetVarName}`) || stackEntries.get(`main()::${targetVarName}`);
      const targetAddr = targetVar ? targetVar.address : '0x0000';
      const targetVal = targetVar ? targetVar.value : 0;
      const ptrAddr = allocateStackAddress(8);
      const key = `${activeScope}::${ptrName}`;

      stackEntries.set(key, {
        name: ptrName,
        scope: activeScope,
        type: `${type}*`,
        value: targetAddr,
        prevValue: null,
        history: [],
        hasChanged: false,
        isCreated: true,
        address: ptrAddr,
        size: 8,
        isPointer: true,
        targetName: targetVarName,
        targetValue: targetVal,
        isUpdated: true
      });

      createSnapshot(lineNum, stmt);
      return;
    }

    // 7. Pointer dereference assignment: *p = 100;
    const ptrDerefAssign = /^\*([a-zA-Z_]\w*)\s*=\s*([^;]+);/.exec(stmt);
    if (ptrDerefAssign) {
      const ptrName = ptrDerefAssign[1];
      const valExpr = ptrDerefAssign[2];
      const newVal = evaluateExpr(valExpr);
      const key = `${activeScope}::${ptrName}`;
      const ptr = stackEntries.get(key) || stackEntries.get(`main()::${ptrName}`);

      if (ptr && ptr.isPointer) {
        if (ptr.targetValue !== newVal) {
          ptr.history = ptr.history || [];
          ptr.history.push(ptr.targetValue);
          ptr.prevValue = ptr.targetValue;
          ptr.targetValue = newVal;
          ptr.hasChanged = true;
          ptr.isUpdated = true;
        }

        if (ptr.targetName) {
          const targetVar = stackEntries.get(`${activeScope}::${ptr.targetName}`) || stackEntries.get(`main()::${ptr.targetName}`);
          if (targetVar && targetVar.value !== newVal) {
            targetVar.history = targetVar.history || [];
            targetVar.history.push(targetVar.value);
            targetVar.prevValue = targetVar.value;
            targetVar.value = newVal;
            targetVar.hasChanged = true;
            targetVar.isUpdated = true;
          }
        } else if (heapBlocks.has(ptr.value)) {
          heapBlocks.get(ptr.value).value = newVal;
        }
      }

      createSnapshot(lineNum, stmt);
      return;
    }

    // 8. Array Declaration: int arr[3] = {10, 20, 30};
    const arrDeclMatch = /^(int|double|float|char|bool|string)\s+([a-zA-Z_]\w*)\[(\d+)\](\s*=\s*\{([^}]*)\})?\s*;/.exec(stmt);
    if (arrDeclMatch) {
      const type = arrDeclMatch[1];
      const arrName = arrDeclMatch[2];
      const size = parseInt(arrDeclMatch[3], 10);
      const initVals = arrDeclMatch[5]
        ? arrDeclMatch[5].split(',').map(v => evaluateExpr(v.trim()))
        : [];

      const elemSize = TYPE_SIZES[type] || 4;
      const baseAddr = allocateStackAddress(size * elemSize);
      const elements = [];

      for (let i = 0; i < size; i++) {
        const elemAddr = (parseInt(baseAddr, 16) + (i * elemSize)).toString(16).toUpperCase();
        elements.push({
          index: i,
          address: `0x${elemAddr}`,
          value: initVals[i] !== undefined ? initVals[i] : 0,
          prevValue: null,
          history: [],
          hasChanged: false,
          isCreated: true,
          isUpdated: true
        });
      }

      const key = `${activeScope}::${arrName}`;
      stackEntries.set(key, {
        name: arrName,
        scope: activeScope,
        type: `${type}[${size}]`,
        address: baseAddr,
        size: size * elemSize,
        isArray: true,
        elements: elements,
        history: [],
        hasChanged: false,
        isCreated: true,
        isUpdated: true
      });

      createSnapshot(lineNum, stmt);
      return;
    }

    // 9. Array Element Assignment: arr[1] = 99;
    const arrAssignMatch = /^([a-zA-Z_]\w*)\[([^\]]+)\]\s*=\s*([^;]+);/.exec(stmt);
    if (arrAssignMatch) {
      const arrName = arrAssignMatch[1];
      const idx = evaluateExpr(arrAssignMatch[2]);
      const newVal = evaluateExpr(arrAssignMatch[3]);

      const key = `${activeScope}::${arrName}`;
      const arr = stackEntries.get(key) || stackEntries.get(`main()::${arrName}`);
      if (arr && arr.isArray && arr.elements[idx]) {
        const el = arr.elements[idx];
        if (el.value !== newVal) {
          el.history = el.history || [];
          el.history.push(el.value);
          el.prevValue = el.value;
          el.value = newVal;
          el.hasChanged = true;
          el.isUpdated = true;
          arr.hasChanged = true;
          arr.isUpdated = true;
        }
      }

      createSnapshot(lineNum, stmt);
      return;
    }

    // 10. Standard Variable Declaration: int x = 10;
    const varDeclMatch = /^(int|double|float|char|bool|string|auto)\s+([a-zA-Z_]\w*)(\s*=\s*([^;]+))?\s*;/.exec(stmt);
    if (varDeclMatch) {
      const type = varDeclMatch[1];
      const varName = varDeclMatch[2];
      const valExpr = varDeclMatch[4];
      const initialVal = valExpr !== undefined ? evaluateExpr(valExpr) : (type === 'string' ? '""' : 0);
      const addr = allocateStackAddress(TYPE_SIZES[type] || 4);
      const key = `${activeScope}::${varName}`;

      stackEntries.set(key, {
        name: varName,
        scope: activeScope,
        type: type,
        value: initialVal,
        prevValue: null,
        history: [],
        hasChanged: false,
        isCreated: true,
        address: addr,
        size: TYPE_SIZES[type] || 4,
        isUpdated: true
      });

      stackEntries.forEach(p => {
        if (p.isPointer && p.targetName === varName) {
          if (p.targetValue !== initialVal) {
            p.history = p.history || [];
            p.history.push(p.targetValue);
            p.prevValue = p.targetValue;
            p.targetValue = initialVal;
            p.hasChanged = true;
            p.isUpdated = true;
          }
        }
      });

      createSnapshot(lineNum, stmt);
      return;
    }

    // 11. Increment/Decrement or Assignment: x++; x = 20;
    const incDecMatch = /^([a-zA-Z_]\w*)(\+\+|--);/.exec(stmt);
    if (incDecMatch) {
      const varName = incDecMatch[1];
      const op = incDecMatch[2];
      const key = `${activeScope}::${varName}`;
      const v = stackEntries.get(key) || stackEntries.get(`main()::${varName}`);

      if (v) {
        const newVal = op === '++' ? Number(v.value) + 1 : Number(v.value) - 1;
        v.history = v.history || [];
        v.history.push(v.value);
        v.prevValue = v.value;
        v.value = newVal;
        v.hasChanged = true;
        v.isUpdated = true;

        stackEntries.forEach(p => {
          if (p.isPointer && p.targetName === varName) {
            p.history = p.history || [];
            p.history.push(p.targetValue);
            p.prevValue = p.targetValue;
            p.targetValue = v.value;
            p.hasChanged = true;
            p.isUpdated = true;
          }
        });

        createSnapshot(lineNum, stmt);
      }
      return;
    }

    const reassignMatch = /^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=|%=|=)\s*([^;]+);/.exec(stmt);
    if (reassignMatch) {
      const varName = reassignMatch[1];
      const op = reassignMatch[2];
      const rhsExpr = reassignMatch[3];
      const rhsVal = evaluateExpr(rhsExpr);

      const key = `${activeScope}::${varName}`;
      const v = stackEntries.get(key) || stackEntries.get(`main()::${varName}`);

      if (v) {
        let newVal = v.value;
        if (op === '=') newVal = rhsVal;
        else if (op === '+=') newVal = Number(v.value) + Number(rhsVal);
        else if (op === '-=') newVal = Number(v.value) - Number(rhsVal);
        else if (op === '*=') newVal = Number(v.value) * Number(rhsVal);
        else if (op === '/=') newVal = Math.floor(Number(v.value) / (Number(rhsVal) || 1));
        else if (op === '%=') newVal = Number(v.value) % (Number(rhsVal) || 1);

        if (v.value !== newVal) {
          v.history = v.history || [];
          v.history.push(v.value);
          v.prevValue = v.value;
          v.value = newVal;
          v.hasChanged = true;
          v.isUpdated = true;

          stackEntries.forEach(p => {
            if (p.isPointer && p.targetName === varName) {
              p.history = p.history || [];
              p.history.push(p.targetValue);
              p.prevValue = p.targetValue;
              p.targetValue = v.value;
              p.hasChanged = true;
              p.isUpdated = true;
            }
          });
        }

        createSnapshot(lineNum, stmt);
      }
      return;
    }

    // 12. Return
    if (stmt.startsWith('return')) {
      createSnapshot(lineNum, stmt);
      return;
    }

    // Fallback step
    createSnapshot(lineNum, stmt);
  };

  // Run main() statements sequentially
  const maxIterations = 300;
  let iterCount = 0;

  for (let sIdx = 0; sIdx < mainStatements.length && iterCount < maxIterations; sIdx++) {
    iterCount++;
    const { lineNum, code: stmt } = mainStatements[sIdx];
    executeStatement(lineNum, stmt);
  }

  return steps;
};
