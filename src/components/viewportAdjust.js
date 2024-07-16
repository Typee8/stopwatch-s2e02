function viewportAdjust() {
  setRealVieportHeight();
}

function setRealVieportHeight() {
  const windowHeight = window.innerHeight;
  const cssRoot = document.documentElement;
  cssRoot.style.setProperty("--windowVH", `${windowHeight}px`);
}

export default viewportAdjust;
