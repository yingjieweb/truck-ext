chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const token = "";
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
