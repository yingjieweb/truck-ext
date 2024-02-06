const oldBtn = document.querySelector('button[onclick="createRemoteQrcode()"]');
const textareaElement = document.querySelector("#devtool-qrcode-input");

// Retrieve the textarea value from local storage
const storedTextareaValue = localStorage.getItem("threshRouteCache");
if (storedTextareaValue) {
  textareaElement.value = storedTextareaValue;
  // Hack: Adjust textarea height by manual -> ./changeStyles.js
  setTimeout(() => {
    textareaElement.dispatchEvent(
      new Event("input", {
        bubbles: true,
        cancelable: true,
      })
    );
  });
}

const newBtn = document.createElement("button");
newBtn.textContent = "创建远程调试二维码";
newBtn.id = "devtool-qrcode-trigger-btn";
newBtn.addEventListener("click", () => {
  const textareaValue = textareaElement.value;
  const url = new URL(textareaValue);
  const encodedSearchParams = Array.from(url.searchParams)
    .map(
      ([paramName, paramValue]) =>
        `${paramName}=${encodeURIComponent(paramValue)}`
    )
    .join("&");
  const encodeUrl = `${url.protocol}${url.pathname}${
    encodedSearchParams ? "?" : ""
  }${encodedSearchParams}`;
  textareaElement.value = encodeUrl;
  oldBtn.click();
  textareaElement.value = textareaValue;
});

oldBtn.parentNode.insertBefore(newBtn, oldBtn.nextSibling);
oldBtn.style.display = "none";

// Listen textarea's value and update local storage
textareaElement.addEventListener("input", () => {
  const updatedTextareaValue = textareaElement.value;
  localStorage.setItem("threshRouteCache", updatedTextareaValue);
});

// Optimize global styles
const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = chrome.runtime.getURL("src/content-scripts/threshDevtool/style.css");
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
