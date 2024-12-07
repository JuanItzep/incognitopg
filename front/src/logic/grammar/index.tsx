// Importa el Parser desde el archivo generado por Peggy.js
import * as Parser from './grammar.jsx';

// Interfaz para manejar peg$SyntaxError
interface PegSyntaxError extends Error {
  location: {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  };
}

declare var PegSyntaxError: {
  prototype: PegSyntaxError;
  new (message: string, expected: any, found: any, location: any): PegSyntaxError;
};

function Compile(text: string): string|PegSyntaxError {
  try {
    let result = Parser.parse(text.trim());
    console.log(result);
    if (result === null || result === undefined) {
      return 'compilo muy bien';
    }
    return result;
  } catch (e) {
    // Verifica si el error es una instancia de PegSyntaxError
    console.log("no deberia de haber un error")
    if (e instanceof (Parser.SyntaxError as any)) {
      const error = e as PegSyntaxError;
      return `Error: ${error.message} at Linea: ${error.location.start.line}, Columna: ${error.location.start.column}`;
    } else {
      console.log(e);
      return String(e);
    }
  }
}

export {
    Compile,
    PegSyntaxError as SyntaxError
}
    ;
