const oldBtn = document.querySelector('button[onclick="createRemoteQrcode()"]');
const textareaElement = document.querySelector("#devtool-qrcode-input");

const newBtn = document.createElement("button");
newBtn.textContent = "创建远程调试二维码";
newBtn.id = "devtool-qrcode-trigger-btn";
newBtn.addEventListener("click", () => {
  const textareaValue = textareaElement.value;
  const url = new URL(textareaValue);
  for (const [paramName, paramValue] of url.searchParams) {
    const encodedValue = encodeURIComponent(paramValue);
    url.searchParams.set(paramName, encodedValue);
  }
  const encodedUrl = url.toString();
  textareaElement.value = encodedUrl;
  oldBtn.click();
  textareaElement.value = textareaValue;
});

oldBtn.parentNode.insertBefore(newBtn, oldBtn.nextSibling);
oldBtn.style.display = "none";
