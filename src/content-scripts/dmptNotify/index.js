(() => {
  const isDynamicRelease = window.location.href.includes("publishPlanDynamic");
  if (!isDynamicRelease) return; // publishPlanDynamic / appPublishPlan

  addCustomStyles();
  setTimeout(() => {
    addNotification();
  }, 1000);
})();

function addCustomStyles() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("src/content-scripts/dmptNotify/style.css");
  document.head.appendChild(link);
}

function addNotification() {
  const notificationBtn = document.createElement("button");
  notificationBtn.textContent = "通知合并分支并上线";
  notificationBtn.id = "dmpt-notify-trigger-btn";
  notificationBtn.addEventListener("click", collectInfo, false);
  const currentStatusElement = document.querySelector("p.ng-binding");
  currentStatusElement.parentNode.addEventListener("click", () => {
    setTimeout(() => {
      document.querySelector("tbody.pointerTbody").append(notificationBtn);
    }, 1000);
  });
}

function collectInfo() {
  toggleLoadingVisible(true);
  const releaseInfo = document.querySelector("h3.ng-binding")?.textContent;
  const formatedReleaseInfo = releaseInfo?.replace(/ /g, "");
  const formatedReleaseInfoList = formatedReleaseInfo.split("\n");
  const releaseName = formatedReleaseInfoList[0];
  const releaseTime = formatedReleaseInfoList[1];
  const releaseOwner =
    document.querySelector("strong.text-danger")?.textContent;
  const operatePerson = document.querySelector(
    ".nav-tab-right span.ng-binding"
  )?.textContent;
  const deployTabElement = document.querySelector("i.fa.fa-rocket");
  deployTabElement.click();
  setTimeout(() => {
    const moduleNameList = document.querySelectorAll(
      "tr.wrapTr.ng-scope > td:nth-child(3)"
    );
    const branchNameList = document.querySelectorAll(
      "tr.wrapTr.ng-scope > td:nth-child(4)"
    );
    const pluginsInfo = Array.from(moduleNameList).map((item, index) => ({
      module: item.textContent.replace(/ | \n/g, ""),
      branch: branchNameList[index].textContent.replace(/ | \n/g, ""),
    }));
    if (!pluginsInfo.length) {
      showMessage("failure", "未检测到关联的插件，无需发送通知");
      toggleLoadingVisible(false)
      return;
    }
    const message =
      `### 检测到客户端插件有上线变更 \n` +
      `- 发布计划：**[${releaseName}](${window.location.href})** \n` +
      `- 发布日期：${releaseTime}  \n` +
      `- 发布负责人：${releaseOwner} \n` +
      `- 上线变更操作人：${operatePerson} \n` +
      `- 上线变更时间：${getCurrentTime()} \n\n` +
      `**本次发布涉及插件如下:** \n\n` +
      `${pluginsInfo
        .map((item) => `- 🧩 ${item.module} \n - 🌲 ${item.branch}`)
        .join("\n")}` +
      `请相关插件 owner 及时将上线的分支合并至 master!`;
    notifyDing(message);
  }, 2000);
}

function getCurrentTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();

  return (
    year +
    "-" +
    padZero(month) +
    "-" +
    padZero(date) +
    " " +
    padZero(hours) +
    ":" +
    padZero(minutes) +
    ":" +
    padZero(seconds)
  );
}

function padZero(num) {
  return num < 10 ? "0" + num : num;
}

function notifyDing(markdownText) {
  chrome.runtime.sendMessage(
    {
      msgtype: "markdown",
      markdown: {
        title: "检测到客户端插件有上线变更",
        text: markdownText,
      },
      at: {
        isAtAll: true,
      },
    },
    (data) => {
      toggleLoadingVisible(false);
      if (data?.errcode === 0) {
        showMessage("success", "钉钉消息发送成功，请注意查收");
      } else {
        showMessage("failure", data?.errmsg || "钉钉消息发送失败，请重试");
      }
    }
  );
}

function toggleLoadingVisible(status) {
  if (status) {
    const loadingOverlayElement = document.createElement("div");
    loadingOverlayElement.id = "loading-overlay";
    const loadingSpinnerElement = document.createElement("div");
    loadingSpinnerElement.id = "loading-spinner";
    loadingOverlayElement.appendChild(loadingSpinnerElement);
    document.body.appendChild(loadingOverlayElement);
    loadingOverlayElement.style.display = "block";
  } else {
    document.getElementById("loading-overlay").remove();
  }
}

function showMessage(type, text) {
  const messageContainerElement = document.createElement("div");
  messageContainerElement.id = "message-container";
  const messageContentElement = document.createElement("div");
  messageContentElement.id = "message-content";
  messageContentElement.className = `message-${type}`;
  messageContentElement.textContent = text;
  messageContainerElement.appendChild(messageContentElement);
  document.body.appendChild(messageContainerElement);
  setTimeout(() => {
    messageContainerElement.remove();
  }, 3000);
}
