// Optimize global styles
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = chrome.runtime.getURL("src/styles/custom.css");
document.head.appendChild(link);

// Optimize textarea styles
const textarea = document.getElementById("devtool-qrcode-input");
textarea.style.width = '650px';
const textareaInitialHeight = textarea.getBoundingClientRect().height;
textarea.addEventListener("input", (e) => {
  textarea.style.boxSizing = "border-box";
  textarea.style.height = `${textareaInitialHeight}px`;
  if (e.target.scrollHeight > textareaInitialHeight) {
    textarea.style.height = `${e.target.scrollHeight}px`;
  }
});
