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
  notificationBtn.addEventListener("click", notify, false);
  const currentStatusElement = document.querySelector("p.ng-binding");
  currentStatusElement.parentNode.addEventListener("click", () => {
    setTimeout(() => {
      document.querySelector("tbody.pointerTbody").append(notificationBtn);
    }, 1000);
  });
}

function notify() {
  const releaseInfo = document.querySelector("h3.ng-binding")?.textContent;
  const formatedReleaseInfo = releaseInfo?.replace(/ /g, "");
  const formatedReleaseInfoList = formatedReleaseInfo.split("\n");
  const releaseName = formatedReleaseInfoList[0];
  const releaseTime = formatedReleaseInfoList[1];
  const releaseOwner = document.querySelector(
    "span.ng-binding.ng-scope"
  )?.textContent;
  chrome.runtime.sendMessage(
    {
      msgtype: "markdown",
      markdown: {
        title: "检测到客户端插件有上线变更",
        text: `### 检测到客户端插件有上线变更 \n\n - 发布计划：**[${releaseName}](${window.location.href})** \n\n - 发布日期：${releaseTime} \n\n - 发布负责人：${releaseOwner} \n\n 本次发布涉及插件有：**插件a**、**插件a**、**插件a**。相关插件 owner 注意将上线的分支合并至 master!`,
      },
      at: {
        isAtAll: true,
      },
    },
    (data) => {
      if (data?.errcode === 0) {
        alert("钉钉消息发送成功");
      } else {
        alert(data?.errmsg);
      }
    }
  );
}
