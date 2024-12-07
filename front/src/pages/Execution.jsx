import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { debounce } from "lodash";
import * as monaco from "monaco-editor";
import "./Execution.css";
import { Compile } from "../logic/grammar/index";

const Execution = () => {
  const editorRef = useRef(null);
  const consolaRef = useRef(null);
  const [output, setOutput] = useState("");
  const valorDefault = "# Aca se veran todos los mensajes de la ejecución";
  const [fileName, setFileName] = useState("");
  const originalModelRef = useRef("");
  const decorationsRef = useRef([]);

  useEffect(() => {
    if (editorRef.current) {
      originalModelRef.current = editorRef.current.getValue();
    }
  }, []);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    originalModelRef.current = editor.getValue();

    editor.updateOptions({
      glyphMargin: true,
      lineNumbers: true,
      minimap: { enabled: false }
    });
  };

  const handleEditorDidMount2 = (editor) => {
    consolaRef.current = editor;
  };

  const clearDecorations = () => {
    if (!editorRef.current) return;
    if (decorationsRef.current.length > 0) {
      editorRef.current.deltaDecorations(decorationsRef.current, []);
      decorationsRef.current = [];
    }
  };

  const updateErrorDecoration = (lineNumber, message) => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    clearDecorations();

    const decoration = {
      range: new monaco.Range(
        lineNumber,
        1,
        lineNumber,
        model.getLineLength(lineNumber) + 1
      ),
      options: {
        isWholeLine: true,
        className: 'errorLine',
        glyphMarginClassName: 'errorGlyph',
        glyphMarginHoverMessage: { value: message }
      }
    };

    decorationsRef.current = editorRef.current.deltaDecorations([], [decoration]);
  };

  const compileContent = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.getValue().trim();
    if (!content) {
      clearDecorations();
      consolaRef.current.setValue(valorDefault);
      return;
    }

    clearDecorations();
    const result = Compile(content);
    
    if (typeof result === 'string' && result.startsWith('Error:')) {
      // Extract line number from error message if available
      const lineMatch = result.match(/Linea: (\d+)/);
      const lineNumber = lineMatch ? parseInt(lineMatch[1]) : 1;
      
      updateErrorDecoration(lineNumber, result);
      consolaRef.current.setValue(result);
    } else {
      consolaRef.current.setValue(result || "Compilación exitosa");
    }
  };

  const handleEditorChange = debounce(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const currentModel = editor.getValue();
    if (currentModel !== originalModelRef.current) {
      compileContent();
      originalModelRef.current = currentModel;
    }
  }, 300);

  const clean = () => {
    editorRef.current.setValue("");
    consolaRef.current.setValue(valorDefault);
    setFileName("");
    clearDecorations();
  };

  const uploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const filereader = new FileReader();

    filereader.readAsText(file);

    filereader.onload = () => {
      editorRef.current.setValue(filereader.result);
      originalModelRef.current = filereader.result;
      compileContent();
    };

    filereader.onerror = () => {
      console.log(filereader.error);
    };
  };

  return (
    <div className="container">
      <div className="header">
        <div className="buttons">
          <label htmlFor="file-upload" className="custom-file-upload">
            Elegir archivo
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".smia"
            style={{ display: "none" }}
            onChange={uploadFile}
          />
          <input
            type="button"
            value="Limpiar"
            id="btnLimpiar"
            className="btn"
            onClick={clean}
          />
        </div>
        <span id="file-name">{fileName || "No se ha seleccionado archivo"}</span>
      </div>

      <div className="input-area">
        <label htmlFor="code">Entrada:</label>
        <Editor
          height="50vh"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            glyphMargin: true,
            lineNumbers: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false
          }}
        />
      </div>

      <div className="output-area" id="output">
        <label htmlFor="output">Salida:</label>
        <Editor
          height="28vh"
          defaultLanguage="plaintext"
          value={output}
          defaultValue={valorDefault}
          theme="vs-dark"
          options={{ readOnly: true }}
          onMount={handleEditorDidMount2}
        />
      </div>
    </div>
  );
};

export default Execution;