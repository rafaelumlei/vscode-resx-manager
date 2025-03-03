import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Resources } from "../RESXEditor";

const vscode = acquireVsCodeApi();

const App = () => {
  const [langs, setLangs] = useState<string[]>([]); 
  const [data, setData] = useState<Record<string, string[]>>({}); 
  useEffect(() => {
    console.log((window as any).initialData);
    loadResources((window as any).initialData as Resources);
  }, []);

  const loadResources = (resources: Resources) => {
    const parser = new DOMParser();
    const parsedData: Record<string, string[]> = {};
    const langs = Object.keys(resources)
      .sort((a, b) => a == 'Default' ? -3 : a.toLowerCase().includes('en') ? -2 : a.localeCompare(b));

    langs.forEach((lang, i) => {
      const xmlDoc = parser.parseFromString(resources[lang], "text/xml");
      const items = Array.from(xmlDoc.getElementsByTagName("data"));
      items.forEach((item) => {
        const key = item.getAttribute("name") || "";
        const value = item.getElementsByTagName("value")[0]?.textContent || "";
        parsedData[key] ??= (parsedData[key] ?? new Array(langs.length).fill(''));
        parsedData[key][i] = value;
      });
    });

    setLangs(langs);
    setData(parsedData);
  };

  const updateValue = (key: string, value: string) => {
    // setData((prev) => ({ ...prev, [key]: value }));
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
      <table>
        <thead>
          <tr>
            <th>Key</th>
            {langs.map((lang) => (<th>{lang}</th>))}
            </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, values]) => (
            <tr key={key}>
              <td>{key}</td>
              {values.map(v => (
                <td>
                  <input
                    type="text"
                    value={v}
                    onChange={(e) => updateValue(key, e.target.value)}
                  />
                </td>
              ))}
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