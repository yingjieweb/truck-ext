document.addEventListener("DOMContentLoaded", () => {
  const webhookTokenInput = document.getElementById("webhookTokenInput");

  chrome.storage.sync.get('webhookToken', (result) => {
    if (result.webhookToken) {
      webhookTokenInput.value = result.webhookToken;
    }
  });

  webhookTokenInput.addEventListener("input", () => {
    const webhookToken = webhookTokenInput.value;
    chrome.storage.sync.set({ webhookToken })
  });
});
