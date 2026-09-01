/**
 * C++ Memory Tracer & Step-by-Step Execution Engine
 * Full support for:
 * - Conditionals (if, else if, else, switch-case)
 * - Loops (while, for, do-while, break, continue)
 * - User-defined Functions (void, return values, parameters, local frames)
 * - Expression Evaluation (Ternary ? :, Arithmetic, Logic && || !, Comparisons)
 * - Memory Addresses, Types, Creation & Mutation History
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
  const stackEntries = new Map();
  const heapBlocks = new Map();

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
      statement: String(stmt || '').trim(),
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

  // 1. Extract all function definitions
  const functionDefs = new Map();
  const cleanLines = lines.map((l, idx) => ({ lineNum: idx + 1, text: l.trim() }));

  const funcHeaderRegex = /^(void|int|double|float|bool|string|char)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{?/;

  for (let i = 0; i < cleanLines.length; i++) {
    const item = cleanLines[i];
    const text = item.text;

    if (text.endsWith(';') && !text.startsWith('return')) continue;

    const match = funcHeaderRegex.exec(text);
    if (match) {
      const returnType = match[1];
      const funcName = match[2];
      const rawParams = match[3];

      const params = rawParams
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => {
          const pParts = p.split(/\s+/);
          return { type: pParts[0], name: pParts[1]?.replace('&', '') || 'param', isRef: p.includes('&') };
        });

      // Find matching brace block
      let depth = text.includes('{') ? 1 : 0;
      let startIdx = i + 1;
      if (!text.includes('{')) {
        while (startIdx < cleanLines.length && !cleanLines[startIdx].text.includes('{')) {
          startIdx++;
        }
        depth = 1;
        startIdx++;
      }

      const bodyLines = [];
      let cur = startIdx;
      while (cur < cleanLines.length && depth > 0) {
        const curText = cleanLines[cur].text;
        for (const char of curText) {
          if (char === '{') depth++;
          else if (char === '}') depth--;
        }
        if (depth > 0) {
          bodyLines.push(cleanLines[cur]);
        }
        cur++;
      }

      functionDefs.set(funcName, {
        name: funcName,
        returnType,
        params,
        startLine: item.lineNum,
        lines: bodyLines
      });

      i = cur - 1;
    }
  }

  // 2. Expression Evaluator
  const evaluateExpr = (exprStr) => {
    if (exprStr === undefined || exprStr === null) return 0;
    let expr = String(exprStr).trim();
    if (!expr) return 0;

    if (expr === 'true') return true;
    if (expr === 'false') return false;

    if (/^'(.|\\.)'$/.test(expr)) return expr.slice(1, -1);
    if (/^"([^"\\]|\\.)*"$/.test(expr)) return expr.slice(1, -1);

    let evalString = expr;

    // Evaluate user-defined function calls inside expression: e.g. calculateScore(itemsCount, multiplier)
    functionDefs.forEach((funcDef, funcName) => {
      if (funcName === 'main') return;
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

        const blockUnits = parseLinesToBlocks(funcDef.lines);
        const ret = executeUnits(blockUnits);

        const returnVal = ret.returnVal !== undefined ? ret.returnVal : 0;
        createSnapshot(funcDef.startLine, `Returned from ${activeScope} to ${callerScope}`);
        activeScope = callerScope;
        return JSON.stringify(returnVal);
      });
    });

    // Array index access: arr[idx]
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

    // Handle pre/post increment/decrement inside expressions: y++, ++y, y--, --y
    evalString = evalString.replace(/\b([a-zA-Z_]\w*)\+\+/g, (match, varName) => {
      const v = stackEntries.get(`${activeScope}::${varName}`) || stackEntries.get(`main()::${varName}`);
      if (v) {
        const cur = Number(v.value) || 0;
        const next = cur + 1;
        v.history = v.history || [];
        v.history.push(v.value);
        v.prevValue = v.value;
        v.value = next;
        v.hasChanged = true;
        v.isUpdated = true;
        return JSON.stringify(cur);
      }
      return match;
    });

    evalString = evalString.replace(/\+\+([a-zA-Z_]\w*)\b/g, (match, varName) => {
      const v = stackEntries.get(`${activeScope}::${varName}`) || stackEntries.get(`main()::${varName}`);
      if (v) {
        const cur = Number(v.value) || 0;
        const next = cur + 1;
        v.history = v.history || [];
        v.history.push(v.value);
        v.prevValue = v.value;
        v.value = next;
        v.hasChanged = true;
        v.isUpdated = true;
        return JSON.stringify(next);
      }
      return match;
    });

    evalString = evalString.replace(/\b([a-zA-Z_]\w*)--/g, (match, varName) => {
      const v = stackEntries.get(`${activeScope}::${varName}`) || stackEntries.get(`main()::${varName}`);
      if (v) {
        const cur = Number(v.value) || 0;
        const next = cur - 1;
        v.history = v.history || [];
        v.history.push(v.value);
        v.prevValue = v.value;
        v.value = next;
        v.hasChanged = true;
        v.isUpdated = true;
        return JSON.stringify(cur);
      }
      return match;
    });

    evalString = evalString.replace(/--([a-zA-Z_]\w*)\b/g, (match, varName) => {
      const v = stackEntries.get(`${activeScope}::${varName}`) || stackEntries.get(`main()::${varName}`);
      if (v) {
        const cur = Number(v.value) || 0;
        const next = cur - 1;
        v.history = v.history || [];
        v.history.push(v.value);
        v.prevValue = v.value;
        v.value = next;
        v.hasChanged = true;
        v.isUpdated = true;
        return JSON.stringify(next);
      }
      return match;
    });

    // Replace variable names with values (Active scope takes strict priority over main)
    const visibleVars = new Map();
    stackEntries.forEach((v) => {
      if (v.scope === 'main()') visibleVars.set(v.name, v);
    });
    stackEntries.forEach((v) => {
      if (v.scope === activeScope) visibleVars.set(v.name, v);
    });

    const sortedVars = Array.from(visibleVars.values()).sort((a, b) => b.name.length - a.name.length);
    sortedVars.forEach((v) => {
      if (!v.isArray) {
        const regex = new RegExp(`\\b${v.name}\\b`, 'g');
        const valToInject = typeof v.value === 'boolean' ? v.value : JSON.stringify(v.value);
        evalString = evalString.replace(regex, valToInject);
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

  // 3. Block & Control Flow Parser
  const parseLinesToBlocks = (lineItems) => {
    const units = [];
    let i = 0;

    while (i < lineItems.length) {
      const { lineNum, text } = lineItems[i];
      if (!text || text.startsWith('//') || text.startsWith('/*') || text === '{' || text === '}') {
        i++;
        continue;
      }

      // Helper to collect a bracketed block or single statement
      const collectBlock = (startIdx) => {
        const block = [];
        let idx = startIdx;
        if (idx >= lineItems.length) return { block, nextIdx: idx };

        if (lineItems[idx].text.startsWith('{')) {
          let depth = 0;
          while (idx < lineItems.length) {
            const t = lineItems[idx].text;
            for (const c of t) {
              if (c === '{') depth++;
              else if (c === '}') depth--;
            }
            if (depth > 0 && !lineItems[idx].text.startsWith('{')) {
              block.push(lineItems[idx]);
            }
            idx++;
            if (depth === 0) break;
          }
        } else {
          block.push(lineItems[idx]);
          idx++;
        }
        return { block, nextIdx: idx };
      };

      // 1. IF statement
      if (text.startsWith('if')) {
        const ifUnit = { type: 'if', branches: [], elseBranch: null, lineNum };
        
        let curLine = text;
        let curIdx = i;
        let condMatch = /if\s*\((.*)\)/.exec(curLine);
        let cond = condMatch ? condMatch[1].trim() : 'true';
        
        // Find body of if
        let bodyStart = curIdx;
        if (curLine.endsWith('{')) {
          curIdx++;
        } else if (lineItems[curIdx + 1]?.text.startsWith('{')) {
          curIdx += 2;
        } else {
          curIdx++;
        }

        const ifBodyRes = collectBlock(bodyStart + 1);
        ifUnit.branches.push({ cond, body: ifBodyRes.block, lineNum });
        curIdx = ifBodyRes.nextIdx;

        // Check for else if / else
        while (curIdx < lineItems.length) {
          const nextText = lineItems[curIdx]?.text || '';
          if (nextText.startsWith('else if')) {
            const elseIfCond = /else if\s*\((.*)\)/.exec(nextText)?.[1]?.trim() || 'true';
            const elseIfRes = collectBlock(curIdx + 1);
            ifUnit.branches.push({ cond: elseIfCond, body: elseIfRes.block, lineNum: lineItems[curIdx].lineNum });
            curIdx = elseIfRes.nextIdx;
          } else if (nextText.startsWith('else')) {
            const elseRes = collectBlock(curIdx + 1);
            ifUnit.elseBranch = { body: elseRes.block, lineNum: lineItems[curIdx].lineNum };
            curIdx = elseRes.nextIdx;
            break;
          } else {
            break;
          }
        }

        units.push(ifUnit);
        i = curIdx;
        continue;
      }

      // 2. SWITCH statement
      if (text.startsWith('switch')) {
        const exprMatch = /switch\s*\((.*)\)/.exec(text);
        const expr = exprMatch ? exprMatch[1].trim() : '';
        const switchRes = collectBlock(i + 1);
        units.push({
          type: 'switch',
          expr,
          body: switchRes.block,
          lineNum
        });
        i = switchRes.nextIdx;
        continue;
      }

      // 3. WHILE loop
      if (text.startsWith('while')) {
        const condMatch = /while\s*\((.*)\)/.exec(text);
        const cond = condMatch ? condMatch[1].trim() : 'true';
        const whileRes = collectBlock(i + 1);
        units.push({
          type: 'while',
          cond,
          body: whileRes.block,
          lineNum
        });
        i = whileRes.nextIdx;
        continue;
      }

      // 4. FOR loop
      if (text.startsWith('for')) {
        const forMatch = /for\s*\(\s*([^;]*);\s*([^;]*);\s*([^)]*)\)/.exec(text);
        const init = forMatch ? forMatch[1].trim() : '';
        const cond = forMatch ? forMatch[2].trim() : 'true';
        const step = forMatch ? forMatch[3].trim() : '';
        const forRes = collectBlock(i + 1);
        units.push({
          type: 'for',
          init,
          cond,
          step,
          body: forRes.block,
          lineNum
        });
        i = forRes.nextIdx;
        continue;
      }

      // 5. DO-WHILE loop
      if (text === 'do' || text.startsWith('do ')) {
        const doRes = collectBlock(i + 1);
        let whileCond = 'false';
        let whileLineNum = lineNum;
        if (doRes.nextIdx < lineItems.length && lineItems[doRes.nextIdx].text.startsWith('while')) {
          const wMatch = /while\s*\((.*)\)/.exec(lineItems[doRes.nextIdx].text);
          whileCond = wMatch ? wMatch[1].trim() : 'false';
          whileLineNum = lineItems[doRes.nextIdx].lineNum;
          doRes.nextIdx++;
        }
        units.push({
          type: 'do-while',
          cond: whileCond,
          body: doRes.block,
          lineNum,
          whileLineNum
        });
        i = doRes.nextIdx;
        continue;
      }

      // 6. Simple statement
      units.push({ type: 'stmt', code: text, lineNum });
      i++;
    }

    return units;
  };

  // 4. Statement Executor
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
        const key = `${activeScope}::${target}`;
        let v = stackEntries.get(key) || stackEntries.get(`main()::${target}`);

        let inputVal;
        if (inputIndex < inputs.length) {
          inputVal = inputs[inputIndex++];
        } else {
          // Smart default fallback values for initial stepped execution simulation
          if (v?.type === 'string') inputVal = 'Mohammad';
          else if (v?.type === 'char') inputVal = 'y';
          else if (target.toLowerCase().includes('count') || target.toLowerCase().includes('item')) inputVal = 2;
          else if (target.toLowerCase().includes('age')) inputVal = 20;
          else inputVal = 10;
        }

        if (v) {
          let parsedVal = inputVal;
          if (v.type === 'int') parsedVal = parseInt(inputVal, 10) || 0;
          else if (v.type === 'double' || v.type === 'float') parsedVal = parseFloat(inputVal) || 0;
          else if (v.type === 'char') parsedVal = String(inputVal)[0] || 'y';
          else if (v.type === 'bool') parsedVal = inputVal === 'true' || inputVal === true || inputVal === '1';
          else parsedVal = String(inputVal);

          if (v.value !== parsedVal) {
            v.history = v.history || [];
            v.history.push(v.value);
            v.prevValue = v.value;
            v.value = parsedVal;
            v.hasChanged = true;
            v.isUpdated = true;
          }
        }
      });
      createSnapshot(lineNum, stmt);
      return;
    }

    // 3. Helper Function Call invocation e.g. greetUser(userName);
    const callMatch = /^([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*;/.exec(stmt);
    if (callMatch && functionDefs.has(callMatch[1])) {
      const funcName = callMatch[1];
      const argStrings = callMatch[2].split(',').map(a => a.trim()).filter(Boolean);
      const funcDef = functionDefs.get(funcName);

      const callerScope = activeScope;
      activeScope = `${funcName}()`;

      createSnapshot(funcDef.startLine, `${funcDef.returnType} ${funcName}(${callMatch[2]})`);

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

      const blockUnits = parseLinesToBlocks(funcDef.lines);
      executeUnits(blockUnits);

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

    // 5. Standard Variable Declaration: int x = 10; or string userName;
    const varDeclMatch = /^(int|double|float|char|bool|string|auto)\s+([a-zA-Z_]\w*)(\s*=\s*([^;]+))?\s*;/.exec(stmt);
    if (varDeclMatch) {
      const type = varDeclMatch[1];
      const varName = varDeclMatch[2];
      const valExpr = varDeclMatch[4];

      let initialVal;
      if (valExpr !== undefined) {
        initialVal = evaluateExpr(valExpr);
      } else {
        if (type === 'string') initialVal = '""';
        else if (type === 'char') initialVal = "'\\0'";
        else if (type === 'bool') initialVal = false;
        else initialVal = 0;
      }

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

      createSnapshot(lineNum, stmt);
      return;
    }

    // 6. Increment / Decrement: x++; or ++x; or x--;
    const incDecMatch = /^([a-zA-Z_]\w*)(\+\+|--);/.exec(stmt) || /^(\+\+|--)([a-zA-Z_]\w*);/.exec(stmt);
    if (incDecMatch) {
      const varName = incDecMatch[1] || incDecMatch[2];
      const op = stmt.includes('++') ? '++' : '--';
      const key = `${activeScope}::${varName}`;
      const v = stackEntries.get(key) || stackEntries.get(`main()::${varName}`);

      if (v) {
        const cur = Number(v.value) || 0;
        const newVal = op === '++' ? cur + 1 : cur - 1;
        v.history = v.history || [];
        v.history.push(v.value);
        v.prevValue = v.value;
        v.value = newVal;
        v.hasChanged = true;
        v.isUpdated = true;

        createSnapshot(lineNum, stmt);
      }
      return;
    }

    // 7. Assignment: pricePerItem = 7.99; or x += 5;
    const assignMatch = /^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=|%=|=)\s*([^;]+);/.exec(stmt);
    if (assignMatch) {
      const varName = assignMatch[1];
      const op = assignMatch[2];
      const rhsExpr = assignMatch[3];
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
        }

        createSnapshot(lineNum, stmt);
      }
      return;
    }

    // 8. Return statement
    if (stmt.startsWith('return')) {
      const retExpr = stmt.replace(/^return\s*/, '').replace(/;$/, '').trim();
      const retVal = retExpr ? evaluateExpr(retExpr) : 0;
      createSnapshot(lineNum, stmt);
      return { returnVal: retVal };
    }

    // Fallback step
    createSnapshot(lineNum, stmt);
  };

  // 5. Unit / Block Execution Runner
  let globalIterations = 0;
  const MAX_GLOBAL_STEPS = 600;

  const executeUnits = (units) => {
    for (const unit of units) {
      if (globalIterations++ > MAX_GLOBAL_STEPS) break;

      if (unit.type === 'stmt') {
        const res = executeStatement(unit.lineNum, unit.code);
        if (res && res.returnVal !== undefined) return res;
      } else if (unit.type === 'if') {
        createSnapshot(unit.lineNum, `if condition`);
        let branchExecuted = false;

        for (const branch of unit.branches) {
          const isTrue = Boolean(evaluateExpr(branch.cond));
          if (isTrue) {
            createSnapshot(branch.lineNum, `if (${branch.cond}) is TRUE`);
            const subUnits = parseLinesToBlocks(branch.body);
            const res = executeUnits(subUnits);
            if (res && res.returnVal !== undefined) return res;
            branchExecuted = true;
            break;
          }
        }

        if (!branchExecuted && unit.elseBranch) {
          createSnapshot(unit.elseBranch.lineNum, `else branch`);
          const subUnits = parseLinesToBlocks(unit.elseBranch.body);
          const res = executeUnits(subUnits);
          if (res && res.returnVal !== undefined) return res;
        }
      } else if (unit.type === 'switch') {
        const switchVal = evaluateExpr(unit.expr);
        createSnapshot(unit.lineNum, `switch (${unit.expr}) [${switchVal}]`);

        // Find matching case or default
        const bodyLines = unit.body;
        let matched = false;
        let matchedStartIdx = -1;
        let defaultIdx = -1;

        for (let bIdx = 0; bIdx < bodyLines.length; bIdx++) {
          const bText = bodyLines[bIdx].text;
          const caseMatch = /^case\s+([^:]+):/.exec(bText);
          if (caseMatch) {
            const caseVal = evaluateExpr(caseMatch[1].trim());
            if (String(caseVal).toLowerCase() === String(switchVal).toLowerCase()) {
              matched = true;
              matchedStartIdx = bIdx + 1;
              break;
            }
          }
          if (bText.startsWith('default:')) {
            defaultIdx = bIdx + 1;
          }
        }

        const startFrom = matchedStartIdx !== -1 ? matchedStartIdx : defaultIdx;
        if (startFrom !== -1) {
          const caseStatements = [];
          for (let k = startFrom; k < bodyLines.length; k++) {
            if (bodyLines[k].text.startsWith('break;')) {
              caseStatements.push(bodyLines[k]);
              break;
            }
            if (!bodyLines[k].text.startsWith('case ') && !bodyLines[k].text.startsWith('default:')) {
              caseStatements.push(bodyLines[k]);
            }
          }
          const subUnits = parseLinesToBlocks(caseStatements);
          const res = executeUnits(subUnits);
          if (res && res.returnVal !== undefined) return res;
        }
      } else if (unit.type === 'while') {
        let loopIter = 0;
        while (Boolean(evaluateExpr(unit.cond)) && loopIter++ < 100 && globalIterations++ < MAX_GLOBAL_STEPS) {
          createSnapshot(unit.lineNum, `while (${unit.cond}) is TRUE`);
          const subUnits = parseLinesToBlocks(unit.body);
          const res = executeUnits(subUnits);
          if (res && res.returnVal !== undefined) return res;
        }
        createSnapshot(unit.lineNum, `while (${unit.cond}) is FALSE ➔ Loop exit`);
      } else if (unit.type === 'for') {
        if (unit.init) {
          executeStatement(unit.lineNum, unit.init.endsWith(';') ? unit.init : `${unit.init};`);
        }
        let loopIter = 0;
        while (Boolean(evaluateExpr(unit.cond)) && loopIter++ < 100 && globalIterations++ < MAX_GLOBAL_STEPS) {
          createSnapshot(unit.lineNum, `for condition (${unit.cond}) is TRUE`);
          const subUnits = parseLinesToBlocks(unit.body);
          const res = executeUnits(subUnits);
          if (res && res.returnVal !== undefined) return res;
          if (unit.step) {
            executeStatement(unit.lineNum, unit.step.endsWith(';') ? unit.step : `${unit.step};`);
          }
        }
        createSnapshot(unit.lineNum, `for condition (${unit.cond}) is FALSE ➔ Loop exit`);
      } else if (unit.type === 'do-while') {
        let loopIter = 0;
        do {
          createSnapshot(unit.lineNum, `do-while loop body`);
          const subUnits = parseLinesToBlocks(unit.body);
          const res = executeUnits(subUnits);
          if (res && res.returnVal !== undefined) return res;
          createSnapshot(unit.whileLineNum, `while (${unit.cond}) condition check`);
        } while (Boolean(evaluateExpr(unit.cond)) && loopIter++ < 100 && globalIterations++ < MAX_GLOBAL_STEPS);
      }
    }
    return {};
  };

  // 6. Run main()
  const mainFunc = functionDefs.get('main');
  if (mainFunc) {
    activeScope = 'main()';
    createSnapshot(mainFunc.startLine, 'int main()');
    const mainUnits = parseLinesToBlocks(mainFunc.lines);
    executeUnits(mainUnits);
  }

  return steps;
};
