/**
 * Renders community-notes.json into the marquee (post image + @handle per comment).
 */
(function () {
  var root = document.querySelector("[data-community-notes-root]");
  if (!root) return;

  var script = document.querySelector('script[src*="community-notes.js"]');
  var assets =
    script && script.src
      ? script.src.replace(/\/[^/]+$/, "/")
      : "assets/";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resolveThumb(comment, posts) {
    if (comment.thumb) return comment.thumb;
    var post = posts[comment.post];
    return post && post.thumb ? post.thumb : "";
  }

  function buildNote(comment, posts) {
    var handle = String(comment.handle || "").replace(/^@/, "");
    var name = comment.name || handle || "Instagram";
    var initial = name.trim().charAt(0).toUpperCase() || "?";
    var thumb = resolveThumb(comment, posts);
    var when = comment.when || "on Instagram";

    var article = document.createElement("article");
    article.className = "note";

    var head = document.createElement("div");
    head.className = "note-head";
    head.innerHTML =
      '<span class="note-avatar" aria-hidden="true">' +
      escapeHtml(initial) +
      "</span>" +
      '<div class="note-meta"><strong>@' +
      escapeHtml(handle) +
      "</strong><span>" +
      escapeHtml(when) +
      "</span></div>";

    article.appendChild(head);

    if (thumb) {
      var img = document.createElement("img");
      img.className = "note-thumb";
      img.src = assets + "images/" + thumb;
      img.alt = posts[comment.post]
        ? "Instagram post: " + posts[comment.post].caption
        : "";
      img.loading = "lazy";
      img.onerror = function () {
        img.remove();
      };
      article.appendChild(img);
    }

    var p = document.createElement("p");
    p.textContent = comment.text || "";
    article.appendChild(p);

    return article;
  }

  function render(data) {
    var posts = data.posts || {};
    var comments = data.comments || [];
    root.replaceChildren(
      ...comments.map(function (c) {
        return buildNote(c, posts);
      })
    );
    document.dispatchEvent(new CustomEvent("community-notes:ready"));
  }

  document.dispatchEvent(new CustomEvent("community-notes:loading"));

  fetch(assets + "community-notes.json")
    .then(function (res) {
      if (!res.ok) throw new Error("community-notes.json missing");
      return res.json();
    })
    .then(render)
    .catch(function () {
      root.innerHTML =
        '<p class="sub">Community notes load when served over HTTP (e.g. Open-Preview.bat).</p>';
      document.dispatchEvent(new CustomEvent("community-notes:error"));
      document.dispatchEvent(new CustomEvent("community-notes:ready"));
    });
})();
