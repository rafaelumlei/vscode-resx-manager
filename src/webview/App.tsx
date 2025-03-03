import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const vscode = acquireVsCodeApi();

const App = () => {
  const [data, setData] = useState<Record<string, string>>({}); 
  useEffect(() => {
    parseResx((window as any).initialData);
  }, []);

  const parseResx = (xmlString: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const items = Array.from(xmlDoc.getElementsByTagName("data"));
    const parsedData: Record<string, string> = {};

    items.forEach((item) => {
      const key = item.getAttribute("name") || "";
      const value = item.getElementsByTagName("value")[0]?.textContent || "";
      parsedData[key] = value;
    });

    setData(parsedData);
  };

  const updateValue = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const saveChanges = () => {
    let xml = '<?xml version="1.0" encoding="utf-8"?><root>';
    Object.entries(data).forEach(([key, value]) => {
      xml += `<data name="${key}"><value>${value}</value></data>`;
    });
    xml += "</root>";

    vscode.postMessage({ command: "update", data: xml });
  };

  return (
    <div>
      <h2>RESX Table Editor</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateValue(key, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveChanges}>Save</button>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);