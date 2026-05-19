/** Prefer .jpg when present (e.g. after Instagram sync); keep .svg src for file:// preview. */
(function () {
  document.querySelectorAll("img[data-jpg]").forEach(function (img) {
    var jpg = img.getAttribute("data-jpg");
    if (!jpg) return;
    var probe = new Image();
    probe.onload = function () {
      img.src = jpg;
    };
    probe.src = jpg;
  });
})();
