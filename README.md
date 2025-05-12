# 🧠 VS Code Python Code Summariser

A Visual Studio Code extension that uses OpenAI to **summarise Python code** and **suggest improvements** — all from right inside the editor.

![VS Code Summary Panel Screenshot](./screenshots/summary-panel.png)

## ✨ Features

- ✅ Summarise selected Python code in plain English  
- ✅ Get intelligent optimisation tips powered by GPT  
- ✅ Export summaries to a Markdown file  
- ✅ Light & dark mode support  
- ✅ Clean, modern side panel UX

---

## 🚀 Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/FrankEllis90/vscode-python-code-summariser.git
cd vscode-python-code-summariser
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your OpenAI API key

Set it in `.vscode/launch.json`:

```json
"env": {
  "OPENAI_API_KEY": "your-key-here"
}
```

> ⚠️ Never commit your real API key.

### 4. Launch in VS Code

Press `F5` in VS Code to launch the extension in a new window.

---

## 🛠️ Usage

1. Select a block of Python code.  
2. Right-click and choose **“Summarise Selected Python Code”**.  
3. View your AI-generated summary in the side panel.  
4. Optionally export the result to Markdown.

---

## 📦 Build / Compile

To compile:

```bash
npm run compile
```

To watch changes during development:

```bash
npm run watch
```

---

## 📁 Project Structure

- `src/extension.ts` – main extension logic  
- `dist/` – compiled output  
- `.vscode/launch.json` – debug config (should not be committed with secrets)  
- `screenshots/` – preview images for GitHub  

---

## 🧪 Example

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

**AI Summary:**
> Defines a recursive function to calculate the n-th Fibonacci number. It uses a base case for n <= 1 and recursively adds the two previous numbers for higher values.

---

## 🧠 Powered by

- [OpenAI GPT-3.5 Turbo](https://platform.openai.com/docs/)
- [VS Code Extension API](https://code.visualstudio.com/api)

---

## 🧑‍💻 Author

**Frank Ellis**  
[LinkedIn](www.linkedin.com/in/frank-ellis-6881894a)  
[GitHub](https://github.com/FrankEllis90)

---

## 📄 License

MIT — free to use, improve, and share.
