{
   // Genera rago de caracteres Unicode
  function generateUnicodeRange(start, end) {
    const result = [];
    const startCode = start.codePointAt(0);
    const endCode = end.codePointAt(0);
    if (startCode > endCode) {
      throw new Error(`Invalid range '${start}-${end}'.`);
    }
    for (let i = startCode; i <= endCode; i++) {
      result.push(String.fromCodePoint(i));
    }
    return result;
  }
  function resolveRules(definitions) {
       // Crea un mapa de reglas
    const ruleMap = {};
    definitions.forEach(def => {
      ruleMap[def.identifier] = def.expr;
    });
    //Resuelve la regla hasta el final 
    function resolveRule(expr, resolvedRules = new Set()) {
      // If expr is a string or array, return it directly
      if (typeof expr === 'string' || Array.isArray(expr)) {
        return expr;
      }
     // Maneja diferentes tipos de expresiones
      if (!expr) {
        return undefined;
      }
        // Evita enciclamientos
      if (expr.name && resolvedRules.has(expr.name)) {
        throw new Error(`Circular reference detected for rule: ${expr.name}`);
      }
    // Si es una elección, intenta resolver cada opción
    if (expr.type === 'choice') {
        for (const option of expr.options) {
            const resolvedOption = resolveRule(option, resolvedRules);
            if (resolvedOption !== undefined) {
                return resolvedOption;
            }
        }
        return undefined;
    }
    // Si es una regla la mira en el mapa
      if (expr.type === 'ruleReference') {
        resolvedRules.add(expr.name);
        return resolveRule(ruleMap[expr.name], resolvedRules);
      }
      // Resuelve la primera regla y devuelve su valor final
      if (expr.type === 'group') {
        return resolveRule(expr.expr, resolvedRules);
      }
      // Si es una  Kleene, resuelva la expresión base
      if (expr.type === 'kleeneStar') {
        const baseExpr = resolveRule(expr.expr, resolvedRules);
        // En lugar de devolver un array vacío, devuelve un array con el contenido base
        return baseExpr ? [baseExpr] : [];
      }
      return expr;
    }
    // Resuelve la primera regla y devuelve su valor final
    const firstRuleName = Object.keys(ruleMap)[0];
    const resolvedValue = resolveRule(ruleMap[firstRuleName]);
    
    return `${firstRuleName}: ${JSON.stringify(resolvedValue)}`;
  }
}

start
  = definitions:definition+ {
      return resolveRules(definitions);
    }

definition
  =  _ identifier:identifier _ "=" _ expr:choiceExpression _ ";" _ {
      return { identifier, expr };
    }

choiceExpression
  = head:repeatedExpression
    tail:(_ "/" _ repeatedExpression)* {
      if (tail.length === 0) {
        return head;
      }
      return {
        type: 'choice', 
        options: [head, ...tail.map(t => t[3])]
      };
    }

repeatedExpression
    = expr:expression _ Operator:("*"/"+"/"?") {
          if (Operator[0]==="*") return { type: 'kleeneStar', expr };
        if (Operator[0]==="+") return { type: 'OneOrMore', expr };
        if (Operator[0]==="?") return { type: 'ZeroOrOne', expr };
        }
    /(_ expression _)+
    / expression



expression
  = group
  / definition
  / ruleReference
  / range
  / list
  / string

group "grouped expression"
  = "(" _ expr:choiceExpression _ ")" {
      return { type: 'group', expr };
    }

ruleReference "rule reference"
  = identifier:identifier {
      return { type: 'ruleReference', name: identifier };
    }

identifier "identifier"
  = [a-zA-Z_][a-zA-Z0-9_]* {
      return text();
    }

range "range"
  = "[" startChar:unicodeChar "-" endChar:unicodeChar "]" {
      return generateUnicodeRange(startChar, endChar);
    }

list "list"
  = "[" chars:character* "]" {
      return chars;
    }

unicodeChar "Unicode character"
  = char:. {
      return char;
    }

character "character"
  = [^\]-]  // Cualquier caracter excepto ']' or '-'

string "string"
  = "\"" text:[^\"]* "\"" {
      return text.join('');
    }
  / "'" text1:[^\']* "'" {
      return text1.join('');
    }

_ "whitespace"
  = [ \t\n\r]*