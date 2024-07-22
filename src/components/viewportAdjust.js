function viewportAdjust() {
  setRealVieportHeight();

  let resizeTimeoutId = null;
  window.addEventListener("scroll", () => {
    if (window.innerWidth >= 760) {
      return;
    }

    if (resizeTimeoutId !== null) {
      clearTimeout(resizeTimeoutId);
    }
    resizeTimeoutId = setTimeout(async () => {
      stickToTheNearestTask("smooth");
    }, 3000);
  });
}

function setOpacityToZero() {
  const rootWrapper = document.querySelector(".root__wrapper");
  rootWrapper.style.opacity = 0;
}

function setOpacityToOne() {
  const rootWrapper = document.querySelector(".root__wrapper");
  rootWrapper.style.opacity = 1;
}

async function setRealVieportHeight() {
  const windowHeight = window.innerHeight;
  const cssRoot = document.documentElement;
  cssRoot.style.setProperty("--windowVH", `${windowHeight}px`);
}

function stickToTheNearestTask(behavior) {
  const { nearestTask } = findNearestTask();
  console.log(nearestTask);
  let { margin, padding } = getComputedStyle(nearestTask);
  margin = parseInt(margin);
  padding = parseInt(padding);

  const nearestTaskLocation = nearestTask.getBoundingClientRect().top;

  window.scrollTo({
    top: window.scrollY + nearestTaskLocation - padding,
    behavior: behavior,
  });
}

function findNearestTask() {
  const tasksList = Array.from(
    document.querySelectorAll(".task, .addTask, .tasksDone__header")
  );

  const distanceFromViewportList = tasksList.map(
    (item) => {
      return Math.abs(item.getBoundingClientRect().top);}
  );

  const nearestTaskValue = distanceFromViewportList.reduce((acc, curr) => {
    return acc < curr ? acc : curr;
  });

  const nearestTaskIndex = distanceFromViewportList.indexOf(distanceFromViewportList.find((item) =>  {
    return item === nearestTaskValue;
  }));

  const nearestTask = tasksList[nearestTaskIndex];
  return {nearestTask};
}
export default viewportAdjust;
