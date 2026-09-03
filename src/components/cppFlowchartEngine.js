/**
 * C++ to Standard Pseudocode Transpiler & Flowchart AST Generator
 * Supports:
 * - Combined Consecutive I/O (Grouped Output/Input blocks)
 * - Conditionals (if, else if, else, multi-way branching, switch-case)
 * - Loops (for, while, do-while, repeat-until)
 * - Multi-function definitions & calls
 * - Declarations, assignments, arrays, pointers
 */

export const convertCppToPseudocode = (cppCode) => {
  if (!cppCode || !cppCode.trim()) {
    return 'BEGIN Main\n  OUTPUT "Hello World"\nEND Main';
  }

  // 1. Strip comments and empty boilerplates
  let cleanCode = cppCode
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/#include\s*<[^>]+>/g, '')
    .replace(/using\s+namespace\s+std\s*;/g, '')
    .replace(/std::/g, '');

  // Strip forward declarations: e.g. int test(int a);
  cleanCode = cleanCode.replace(/^\s*(void|int|double|float|bool|string|char)\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*;/gm, '');

  // Extract functions
  const funcRegex = /(void|int|double|float|bool|string|char)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
  let match;
  const functions = [];

  while ((match = funcRegex.exec(cleanCode)) !== null) {
    const returnType = match[1];
    const funcName = match[2];
    const rawParams = match[3];
    const startIndex = match.index;
    const bodyStartIndex = startIndex + match[0].length;

    let depth = 1;
    let endIndex = bodyStartIndex;
    while (depth > 0 && endIndex < cleanCode.length) {
      if (cleanCode[endIndex] === '{') depth++;
      else if (cleanCode[endIndex] === '}') depth--;
      endIndex++;
    }

    const funcBody = cleanCode.slice(bodyStartIndex, endIndex - 1);
    functions.push({
      returnType,
      name: funcName,
      rawParams,
      body: funcBody
    });
  }

  // If no functions matched with regex, treat the whole block as main body
  if (functions.length === 0) {
    const mainBody = cleanCode.replace(/int\s+main\s*\(\s*\)\s*\{?/, '').replace(/\}?\s*$/, '');
    functions.push({
      returnType: 'int',
      name: 'main',
      rawParams: '',
      body: mainBody
    });
  }

  const pseudocodeSections = [];

  // Translate a single function block to pseudocode lines
  const translateFunctionBody = (bodyText, isMain = false) => {
    const rawLines = bodyText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('using'));

    const result = [];
    let indentLevel = 1;
    const indent = () => '  '.repeat(indentLevel);

    const blockStack = [];

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];

      // Handle standalone closing brace
      if (line === '}') {
        if (blockStack.length > 0) {
          const top = blockStack.pop();
          indentLevel = Math.max(1, indentLevel - 1);
          const nextLine = rawLines[i + 1] ? rawLines[i + 1].trim().toLowerCase() : '';

          if (top.type === 'IF' && !nextLine.startsWith('else')) {
            result.push(`${indent()}END IF`);
          } else if (top.type === 'WHILE') {
            result.push(`${indent()}END WHILE`);
          } else if (top.type === 'FOR') {
            result.push(`${indent()}END FOR`);
          } else if (top.type === 'DO_WHILE') {
            const condMatch = /while\s*\((.*)\)\s*;?/.exec(nextLine);
            const cond = condMatch ? condMatch[1].trim() : 'condition';
            result.push(`${indent()}UNTIL NOT (${cond})`);
            i++; // skip while line
          } else if (top.type === 'SWITCH') {
            result.push(`${indent()}END SWITCH`);
          }
        }
        continue;
      }

      // Remove trailing brace if attached to line
      if (line.endsWith('{')) {
        line = line.slice(0, -1).trim();
      }

      // 1. IF statement
      if (line.startsWith('if')) {
        const condMatch = /if\s*\((.*)\)/.exec(line);
        const cond = condMatch ? condMatch[1].trim() : line.replace(/^if\s*/, '');
        result.push(`${indent()}IF ${cond} THEN`);
        blockStack.push({ type: 'IF' });
        indentLevel++;
        continue;
      }

      // 2. ELSE IF statement
      if (line.startsWith('else if')) {
        const condMatch = /else if\s*\((.*)\)/.exec(line);
        const cond = condMatch ? condMatch[1].trim() : line.replace(/^else if\s*/, '');
        indentLevel = Math.max(1, indentLevel - 1);
        result.push(`${indent()}ELSE IF ${cond} THEN`);
        indentLevel++;
        continue;
      }

      // 3. ELSE statement
      if (line.startsWith('else')) {
        indentLevel = Math.max(1, indentLevel - 1);
        result.push(`${indent()}ELSE`);
        indentLevel++;
        continue;
      }

      // 4. FOR loop: for (int i = 0; i < n; i++)
      if (line.startsWith('for')) {
        const forMatch = /for\s*\(\s*(?:(?:int|size_t|auto)\s+)?([a-zA-Z_]\w*)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)/.exec(line);
        if (forMatch) {
          const varName = forMatch[1];
          const startVal = forMatch[2].trim();
          const cond = forMatch[3].trim();
          const step = forMatch[4].trim();

          let stepStr = '';
          if (step.includes('++')) stepStr = '';
          else if (step.includes('--')) stepStr = ' STEP -1';
          else if (step.includes('+=')) stepStr = ` STEP ${step.replace(/.*=\s*/, '')}`;
          else if (step.includes('-=')) stepStr = ` STEP -${step.replace(/.*=\s*/, '')}`;

          let endVal = cond.replace(new RegExp(`^${varName}\\s*(?:<|<=)\\s*`), '').trim();
          if (cond.includes('<') && !cond.includes('<=')) {
            if (/^\d+$/.test(endVal)) {
              endVal = String(parseInt(endVal, 10) - 1);
            } else {
              endVal = `${endVal} - 1`;
            }
          }

          result.push(`${indent()}FOR ${varName} ← ${startVal} TO ${endVal}${stepStr} DO`);
        } else {
          const genericCond = line.replace(/^for\s*\(/, '').replace(/\)\s*$/, '');
          result.push(`${indent()}FOR (${genericCond}) DO`);
        }
        blockStack.push({ type: 'FOR' });
        indentLevel++;
        continue;
      }

      // 5. WHILE loop
      if (line.startsWith('while')) {
        const condMatch = /while\s*\((.*)\)/.exec(line);
        const cond = condMatch ? condMatch[1].trim() : line.replace(/^while\s*/, '');
        result.push(`${indent()}WHILE ${cond} DO`);
        blockStack.push({ type: 'WHILE' });
        indentLevel++;
        continue;
      }

      // 6. DO-WHILE loop
      if (line === 'do') {
        result.push(`${indent()}REPEAT`);
        blockStack.push({ type: 'DO_WHILE' });
        indentLevel++;
        continue;
      }

      // 7. SWITCH statement
      if (line.startsWith('switch')) {
        const switchMatch = /switch\s*\((.*)\)/.exec(line);
        const expr = switchMatch ? switchMatch[1].trim() : 'expr';
        result.push(`${indent()}SWITCH ${expr}`);
        blockStack.push({ type: 'SWITCH' });
        indentLevel++;
        continue;
      }

      if (line.startsWith('case ')) {
        const caseVal = line.replace(/^case\s+/, '').replace(/:$/, '').trim();
        result.push(`${indent()}CASE ${caseVal}:`);
        continue;
      }

      if (line.startsWith('default:')) {
        result.push(`${indent()}DEFAULT:`);
        continue;
      }

      // 8. Break and Continue
      if (line.startsWith('break;')) {
        result.push(`${indent()}EXIT LOOP`);
        continue;
      }
      if (line.startsWith('continue;')) {
        result.push(`${indent()}NEXT ITERATION`);
        continue;
      }

      // 9. RETURN statement
      if (line.startsWith('return')) {
        const retVal = line.replace(/^return\s*/, '').replace(/;$/, '').trim();
        if (isMain) {
          if (retVal && retVal !== '0') {
            result.push(`${indent()}RETURN ${retVal}`);
          }
        } else {
          result.push(`${indent()}RETURN ${retVal || 'void'}`);
        }
        continue;
      }

      // 10. OUTPUT: cout << ... and printf(...)
      if (line.startsWith('cout')) {
        const rawParts = line.replace(/^cout\s*<</, '').replace(/;$/, '').split('<<');
        const formattedParts = rawParts
          .map(p => p.trim())
          .filter(p => p !== 'endl' && p !== '"\\n"' && p !== "'\\n'" && p.length > 0);

        if (formattedParts.length > 0) {
          result.push(`${indent()}OUTPUT ${formattedParts.join(', ')}`);
        }
        continue;
      }

      if (line.startsWith('printf')) {
        const printfMatch = /printf\s*\((.*)\);?/.exec(line);
        if (printfMatch) {
          result.push(`${indent()}OUTPUT ${printfMatch[1].trim()}`);
        }
        continue;
      }

      // 11. INPUT: cin >> ... and scanf/getline
      if (line.startsWith('cin')) {
        const targets = line.replace(/^cin\s*>>/, '').replace(/;$/, '').split('>>').map(t => t.trim());
        result.push(`${indent()}INPUT ${targets.join(', ')}`);
        continue;
      }

      if (line.startsWith('getline')) {
        const glMatch = /getline\s*\(\s*cin\s*,\s*([^)]+)\)/.exec(line);
        if (glMatch) {
          result.push(`${indent()}INPUT ${glMatch[1].trim()}`);
          continue;
        }
      }

      // 12. Dynamic Heap Allocation: int* p = new int(10);
      const newMatch = /^(?:int|double|float|char|bool|string)\s*\*\s*([a-zA-Z_]\w*)\s*=\s*new\s+([a-zA-Z_]\w*)(?:\((.*)\)|\[(.*)\])?\s*;/.exec(line);
      if (newMatch) {
        const ptrName = newMatch[1];
        const type = newMatch[2];
        const val = newMatch[3] || newMatch[4] || '';
        result.push(`${indent()}${ptrName} ← ALLOCATE ${type}${val ? `(${val})` : ''}`);
        continue;
      }

      // 13. Array Declarations: int arr[5] = {1, 2, 3};
      const arrMatch = /^(?:int|double|float|char|bool|string)\s+([a-zA-Z_]\w*)\[(\d*)\](?:\s*=\s*\{([^}]*)\})?\s*;/.exec(line);
      if (arrMatch) {
        const arrName = arrMatch[1];
        const size = arrMatch[2] ? `[${arrMatch[2]}]` : '[]';
        const initVals = arrMatch[3] ? ` ← [${arrMatch[3].trim()}]` : '';
        result.push(`${indent()}DECLARE ${arrName}${size}${initVals}`);
        continue;
      }

      // 14. Standard Variable Declarations: int x = 10; or int a, b = 20;
      const varDeclMatch = /^(int|double|float|char|bool|string|auto)\s+([^;]+);/.exec(line);
      if (varDeclMatch) {
        const rawDecl = varDeclMatch[2].trim();
        const declParts = rawDecl.split(',').map(p => p.trim());
        declParts.forEach(part => {
          if (part.includes('=')) {
            const [vName, vVal] = part.split('=').map(s => s.trim());
            if (/\b([a-zA-Z_]\w*)\s*\(([^)]*)\)/.test(vVal)) {
              result.push(`${indent()}${vName} ← CALL ${vVal}`);
            } else {
              result.push(`${indent()}${vName} ← ${vVal}`);
            }
          } else {
            result.push(`${indent()}DECLARE ${part}`);
          }
        });
        continue;
      }

      // 15. Increment / Decrement: x++; or ++x; or x--;
      const incMatch = /^([a-zA-Z_]\w*)(\+\+|--)\s*;?/.exec(line) || /^(\+\+|--)([a-zA-Z_]\w*)\s*;?/.exec(line);
      if (incMatch) {
        const varName = incMatch[1] || incMatch[2];
        const op = (incMatch[1] === '++' || incMatch[2] === '++') ? '+ 1' : '- 1';
        result.push(`${indent()}${varName} ← ${varName} ${op}`);
        continue;
      }

      // 16. Compound Assignment: x += 5; x *= 2;
      const compoundMatch = /^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*([^;]+);/.exec(line);
      if (compoundMatch) {
        const varName = compoundMatch[1];
        const op = compoundMatch[2][0];
        const rhs = compoundMatch[3].trim();
        result.push(`${indent()}${varName} ← ${varName} ${op} (${rhs})`);
        continue;
      }

      // 17. Standard Assignment: x = y + 5; or arr[i] = 10; or *ptr = 20;
      const assignMatch = /^((?:\*?[a-zA-Z_]\w*(?:\[[^\]]+\])?))\s*=\s*([^;]+);/.exec(line);
      if (assignMatch) {
        const lhs = assignMatch[1].trim();
        const rhs = assignMatch[2].trim();
        if (/\b([a-zA-Z_]\w*)\s*\(([^)]*)\)/.test(rhs)) {
          result.push(`${indent()}${lhs} ← CALL ${rhs}`);
        } else {
          result.push(`${indent()}${lhs} ← ${rhs}`);
        }
        continue;
      }

      // 18. Standalone Function Call: test(x); or greetUser(userName);
      const funcCallMatch = /^([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*;/.exec(line);
      if (funcCallMatch) {
        result.push(`${indent()}CALL ${funcCallMatch[1]}(${funcCallMatch[2].trim()})`);
        continue;
      }

      // Fallback clean line
      let cleanLine = line.replace(/;$/, '').trim();
      if (cleanLine) {
        result.push(`${indent()}${cleanLine}`);
      }
    }

    // Close any unclosed blocks
    while (blockStack.length > 0) {
      const top = blockStack.pop();
      indentLevel = Math.max(1, indentLevel - 1);
      if (top.type === 'IF') result.push(`${indent()}END IF`);
      else if (top.type === 'WHILE') result.push(`${indent()}END WHILE`);
      else if (top.type === 'FOR') result.push(`${indent()}END FOR`);
      else if (top.type === 'SWITCH') result.push(`${indent()}END SWITCH`);
    }

    return result;
  };

  // Build full pseudocode with separated functions
  functions.forEach(fn => {
    if (fn.name === 'main') {
      pseudocodeSections.push(`BEGIN Main`);
      const bodyLines = translateFunctionBody(fn.body, true);
      pseudocodeSections.push(...bodyLines);
      pseudocodeSections.push(`END Main\n`);
    } else {
      const params = fn.rawParams ? fn.rawParams.replace(/int|double|float|bool|string|char|&/g, '').trim() : '';
      pseudocodeSections.push(`FUNCTION ${fn.name}(${params}) : ${fn.returnType.toUpperCase()}`);
      const bodyLines = translateFunctionBody(fn.body, false);
      pseudocodeSections.push(...bodyLines);
      pseudocodeSections.push(`END FUNCTION\n`);
    }
  });

  return pseudocodeSections.join('\n').trim();
};

/**
 * Parses Pseudocode text into a structured Hierarchical Tree for Flowchart Rendering.
 * Features:
 * - Automatic merging of consecutive OUTPUT statements into a single combined I/O block
 * - Enhanced Conditionals (IF, ELSE IF, ELSE, SWITCH-CASE)
 * - Loop Constructs (WHILE, FOR, REPEAT-UNTIL)
 */
export const parsePseudocodeToFlowchartTree = (pseudocodeText) => {
  if (!pseudocodeText || !pseudocodeText.trim()) return [];

  const rawLines = pseudocodeText.split('\n').map(l => l.trim()).filter(Boolean);

  // Split into function modules if multiple BEGIN/FUNCTION blocks exist
  const modules = [];
  let currentModule = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const upper = line.toUpperCase();

    if (upper.startsWith('BEGIN ') || upper.startsWith('START ') || upper.startsWith('FUNCTION ')) {
      currentModule = {
        name: line.replace(/^(BEGIN|START|FUNCTION)\s+/i, '').replace(/\s*:.*$/, '').trim(),
        header: line,
        lines: []
      };
      modules.push(currentModule);
      continue;
    }

    if (upper.startsWith('END MAIN') || upper.startsWith('END FUNCTION') || upper === 'END') {
      if (currentModule) {
        currentModule.lines.push(line);
        currentModule = null;
      }
      continue;
    }

    if (currentModule) {
      currentModule.lines.push(line);
    } else {
      currentModule = {
        name: 'Main',
        header: 'BEGIN Main',
        lines: [line]
      };
      modules.push(currentModule);
    }
  }

  // Helper to parse blocks of lines into flowchart nodes
  const parseBlock = (linesList, startIndex) => {
    const nodes = [];
    let idx = startIndex;

    while (idx < linesList.length) {
      const line = linesList[idx];
      const upper = line.toUpperCase();

      // Block Terminators for parent context
      if (
        upper.startsWith('ELSE IF') ||
        upper === 'ELSE' ||
        upper === 'END IF' ||
        upper === 'END WHILE' ||
        upper === 'END FOR' ||
        upper === 'END SWITCH' ||
        upper.startsWith('UNTIL') ||
        upper.startsWith('CASE ') ||
        upper === 'DEFAULT:' ||
        upper.startsWith('END MAIN') ||
        upper.startsWith('END FUNCTION') ||
        upper === 'END'
      ) {
        break;
      }

      // 1. IF-ELSE IF-ELSE Branching
      if (upper.startsWith('IF ')) {
        const condition = line.replace(/^IF\s+/i, '').replace(/\s+THEN$/i, '').trim();
        const branchNode = {
          type: 'branch',
          condition,
          trueBranch: [],
          elseIfs: [],
          falseBranch: [],
          color: '#F59E0B'
        };

        idx++; // past IF
        const trueResult = parseBlock(linesList, idx);
        branchNode.trueBranch = trueResult.nodes;
        idx = trueResult.nextIndex;

        // Collect all ELSE IF branches
        while (idx < linesList.length && linesList[idx].toUpperCase().startsWith('ELSE IF')) {
          const elseIfCond = linesList[idx].replace(/^ELSE IF\s+/i, '').replace(/\s+THEN$/i, '').trim();
          idx++;
          const elseIfResult = parseBlock(linesList, idx);
          branchNode.elseIfs.push({
            condition: elseIfCond,
            nodes: elseIfResult.nodes
          });
          idx = elseIfResult.nextIndex;
        }

        // Collect ELSE branch
        if (idx < linesList.length && linesList[idx].toUpperCase() === 'ELSE') {
          idx++; // past ELSE
          const falseResult = parseBlock(linesList, idx);
          branchNode.falseBranch = falseResult.nodes;
          idx = falseResult.nextIndex;
        }

        if (idx < linesList.length && linesList[idx].toUpperCase() === 'END IF') {
          idx++;
        }

        nodes.push(branchNode);
        continue;
      }

      // 2. SWITCH statement
      if (upper.startsWith('SWITCH')) {
        const switchExpr = line.replace(/^SWITCH\s+/i, '').trim();
        const switchNode = {
          type: 'switch',
          expression: switchExpr,
          cases: [],
          color: '#F59E0B'
        };

        idx++; // past SWITCH
        while (idx < linesList.length) {
          const curUpper = linesList[idx].toUpperCase();
          if (curUpper === 'END SWITCH') {
            idx++;
            break;
          }

          if (curUpper.startsWith('CASE ') || curUpper === 'DEFAULT:') {
            const isDefault = curUpper === 'DEFAULT:';
            const caseLabel = isDefault ? 'DEFAULT' : linesList[idx].replace(/^CASE\s+/i, '').replace(/:$/, '').trim();
            idx++;

            // Collect case body
            const caseResult = parseBlock(linesList, idx);
            switchNode.cases.push({
              match: caseLabel,
              nodes: caseResult.nodes,
              isDefault
            });
            idx = caseResult.nextIndex;
          } else {
            idx++;
          }
        }

        nodes.push(switchNode);
        continue;
      }

      // 3. FOR / WHILE Loops
      if (upper.startsWith('WHILE ') || upper.startsWith('FOR ')) {
        const isFor = upper.startsWith('FOR ');
        const condition = line.replace(/^(WHILE|FOR)\s+/i, '').replace(/\s+DO$/i, '').trim();
        const loopNode = {
          type: 'loop',
          loopType: isFor ? 'for' : 'while',
          condition,
          body: [],
          color: '#8B5CF6'
        };

        idx++; // past loop header
        const bodyResult = parseBlock(linesList, idx);
        loopNode.body = bodyResult.nodes;
        idx = bodyResult.nextIndex;

        if (idx < linesList.length && (linesList[idx].toUpperCase() === 'END WHILE' || linesList[idx].toUpperCase() === 'END FOR')) {
          idx++;
        }

        nodes.push(loopNode);
        continue;
      }

      // 4. REPEAT ... UNTIL (Do-While)
      if (upper === 'REPEAT') {
        const loopNode = {
          type: 'loop',
          loopType: 'do-while',
          condition: 'Repeat Condition',
          body: [],
          color: '#8B5CF6'
        };

        idx++; // past REPEAT
        const bodyResult = parseBlock(linesList, idx);
        loopNode.body = bodyResult.nodes;
        idx = bodyResult.nextIndex;

        if (idx < linesList.length && linesList[idx].toUpperCase().startsWith('UNTIL')) {
          loopNode.condition = linesList[idx].replace(/^UNTIL\s+/i, '').trim();
          idx++;
        }

        nodes.push(loopNode);
        continue;
      }

      // 5. COMBINE Consecutive OUTPUT Statements into ONE block
      if (upper.startsWith('OUTPUT ') || upper.startsWith('PRINT ')) {
        const outputItems = [];
        while (idx < linesList.length) {
          const curLine = linesList[idx];
          const curUpper = curLine.toUpperCase();
          if (curUpper.startsWith('OUTPUT ') || curUpper.startsWith('PRINT ')) {
            const content = curLine.replace(/^(OUTPUT|PRINT)\s+/i, '').trim();
            outputItems.push(content);
            idx++;
          } else {
            break;
          }
        }

        nodes.push({
          type: 'io',
          ioType: 'output',
          label: outputItems.length === 1 ? `OUTPUT ${outputItems[0]}` : 'OUTPUT',
          items: outputItems,
          shape: 'parallelogram',
          color: '#00D2FF'
        });
        continue;
      }

      // 6. INPUT Statements (Combined if multiple)
      if (upper.startsWith('INPUT ') || upper.startsWith('READ ')) {
        const inputItems = [];
        while (idx < linesList.length) {
          const curLine = linesList[idx];
          const curUpper = curLine.toUpperCase();
          if (curUpper.startsWith('INPUT ') || curUpper.startsWith('READ ')) {
            const content = curLine.replace(/^(INPUT|READ)\s+/i, '').trim();
            inputItems.push(content);
            idx++;
          } else {
            break;
          }
        }

        nodes.push({
          type: 'io',
          ioType: 'input',
          label: inputItems.length === 1 ? `INPUT ${inputItems[0]}` : 'INPUT',
          items: inputItems,
          shape: 'parallelogram',
          color: '#00D2FF'
        });
        continue;
      }

      // 7. Standalone Nodes: Terminal, Call, Process
      if (upper.startsWith('BEGIN ') || upper.startsWith('START ') || upper.startsWith('FUNCTION ')) {
        nodes.push({
          type: 'terminal',
          label: line,
          shape: 'stadium',
          color: '#3DDC97'
        });
      } else if (upper.startsWith('RETURN ') || upper.startsWith('END ') || upper.startsWith('STOP') || upper.startsWith('END FUNCTION') || upper.startsWith('END MAIN')) {
        nodes.push({
          type: 'terminal',
          label: line,
          shape: 'stadium',
          color: '#FF647C'
        });
      } else if (upper.includes('CALL ')) {
        nodes.push({
          type: 'call',
          label: line,
          shape: 'subroutine',
          color: '#C084FC'
        });
      } else {
        nodes.push({
          type: 'process',
          label: line,
          shape: 'rectangle',
          color: '#818CF8'
        });
      }

      idx++;
    }

    return { nodes, nextIndex: idx };
  };

  // Convert each module to an AST with Start & End terminals
  return modules.map(mod => {
    const { nodes } = parseBlock(mod.lines, 0);
    const fullNodes = [];

    // Ensure module has Start terminal
    fullNodes.push({
      type: 'terminal',
      label: mod.header || `START ${mod.name}`,
      shape: 'stadium',
      color: '#3DDC97'
    });

    fullNodes.push(...nodes);

    // Ensure module has End terminal
    const hasEnd = nodes.length > 0 && nodes[nodes.length - 1].type === 'terminal';
    if (!hasEnd) {
      fullNodes.push({
        type: 'terminal',
        label: `END ${mod.name}`,
        shape: 'stadium',
        color: '#FF647C'
      });
    }

    return {
      moduleName: mod.name,
      nodes: fullNodes
    };
  });
};
