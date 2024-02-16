chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let accessToken =
    "8a4fe80adb14b7aef3cf7773c5639b9cf2199f57b350932f5672fdcdf170abc6";
  chrome.storage.sync.get("webhookToken", (result) => {
    if (chrome.runtime.lastError) {
      // https://open.dingtalk.com/document/robots/custom-robot-access#title-7ur-3ok-s1a
      sendResponse({
        errcode: 310000,
        errmsg: "Error retrieving webhookToken",
      });
    } else {
      accessToken = result.webhookToken;
      const webhookUrl = `https://oapi.dingtalk.com/robot/send?access_token=${accessToken}`;
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })
        .then((response) => {
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
    }
  });
  return true;
});
