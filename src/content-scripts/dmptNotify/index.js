let isWaitDeployTabReady = false;
let waitDeployTabReadyTimer;
let dingMessagesInfo = {};

const observer = new MutationObserver(() => {
  tryAddNotificationBtn();
  if (isWaitDeployTabReady) {
    clearTimeout(waitDeployTabReadyTimer);
    waitDeployTabReadyTimer = setTimeout(() => {
      collectDeployInfo();
      isWaitDeployTabReady = false;
    }, 2000);
  }
});
observer.observe(document, { childList: true, subtree: true });

(() => {
  const isDynamicRelease = window.location.href.includes("publishPlanDynamic");
  if (!isDynamicRelease) return;
  importCustomStyles();
})();

function importCustomStyles() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("src/content-scripts/dmptNotify/style.css");
  document.head.appendChild(link);
}

function tryAddNotificationBtn() {
  const statusSelectElement = document.querySelector(
    ".transparentBorderTbody > tr:first-child button"
  );
  if (statusSelectElement?.onclick) {
    statusSelectElement?.removeEventListener("click", addNotificationBtn);
  } else {
    statusSelectElement?.addEventListener("click", addNotificationBtn);
  }
}

function addNotificationBtn() {
  setTimeout(() => {
    const statusOptionElement = document.querySelector("tbody.pointerTbody");
    if (statusOptionElement?.children.length <= 2) {
      const notificationBtn = document.createElement("button");
      notificationBtn.textContent = "通知合并分支并上线";
      notificationBtn.id = "dmpt-notify-trigger-btn";
      notificationBtn.addEventListener("click", collectBaseInfo, false);
      statusOptionElement.append(notificationBtn);
    }
  }, 200);
}

function collectBaseInfo() {
  toggLoadingVisible(true);
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
  dingMessagesInfo = { releaseName, releaseTime, releaseOwner, operatePerson };
  document.querySelector("i.fa.fa-rocket")?.click();
  isWaitDeployTabReady = true;
}

function collectDeployInfo() {
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
    toggLoadingVisible(false);
    return;
  }
  Object.assign(dingMessagesInfo, { pluginsInfo });
  sendMessagesToDing();
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

function sendMessagesToDing() {
  const { releaseName, releaseTime, releaseOwner, operatePerson, pluginsInfo } =
    dingMessagesInfo;
  const text =
    `### 检测到客户端插件有上线变更，注意合并分支! \n` +
    `- 发布计划：**[${releaseName}](${window.location.href})** 🔍 \n` +
    `- 发布日期：${releaseTime}  \n` +
    `- 发布负责人：${releaseOwner} \n` +
    `- 上线变更操作人：${operatePerson} \n` +
    `- 上线变更时间：${getCurrentTime()} \n\n` +
    `**本次发布涉及插件如下:** \n\n` +
    `${pluginsInfo
      .map((item) => `- 🧩 ${item.module} \n - 🌲 ${item.branch}`)
      .join("\n")}` +
    `请相关插件 owner 及时将上线的分支合并至 master!`;
  chrome.runtime.sendMessage(
    {
      msgtype: "markdown",
      markdown: {
        title: "检测到客户端插件有上线变更",
        text,
      },
      at: {
        isAtAll: true,
      },
    },
    (data) => {
      if (data?.errcode === 0) {
        showMessage("success", "钉钉消息发送成功，请注意查收");
        clickRealReleaseBtn();
      } else {
        showMessage("failure", data?.errmsg || "钉钉消息发送失败，请重试");
      }
      toggLoadingVisible(false);
    }
  );
}

function toggLoadingVisible(status) {
  if (status) {
    const loadingOverlayElement = document.createElement("div");
    loadingOverlayElement.id = "loading-overlay";
    const loadingSpinnerElement = document.createElement("div");
    loadingSpinnerElement.id = "loading-spinner";
    loadingOverlayElement.appendChild(loadingSpinnerElement);
    document.body.appendChild(loadingOverlayElement);
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

function clickRealReleaseBtn() {
  const bullhornTabElement = document.querySelector("i.fa.fa-bullhorn");
  bullhornTabElement.click();
  const realReleaseBtn = document.querySelector(
    "tbody.pointerTbody > tr:nth-child(2)"
  );
  realReleaseBtn.click();
}
