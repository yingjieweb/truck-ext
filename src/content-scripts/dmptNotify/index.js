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
  alert('please merge master')
}
