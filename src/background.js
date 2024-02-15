chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  const defaultToken = "8a4fe80adb14b7aef3cf7773c5639b9cf2199f57b350932f5672fdcdf170abc6";
  const storageToken = await getSyncData("webhookToken")
  const token = storageToken || defaultToken;
  const webhookUrl = `https://oapi.dingtalk.com/robot/send?access_token=${token}`;

  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })
    .then((response) => {
      console.log("response", response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      sendResponse(data);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });

  return true;
});

function getSyncData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

