const API_URL = "http://localhost:5000/api/posts";

function getToken() {
  return localStorage.getItem("token");
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

const form = document.getElementById("createPostForm");
const postsContainer = document.getElementById("postsContainer");

async function loadPosts() {
  if (!postsContainer) {
    console.error("❌ postsContainer not found");
    return;
  }

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    console.log("GET POSTS:", res.status, data);

    if (!res.ok) {
      postsContainer.innerHTML = `<p>Failed to load posts</p>`;
      return;
    }

    renderPosts(data);
  } catch (err) {
    console.error("❌ loadPosts error:", err);
    postsContainer.innerHTML = `<p>Network error</p>`;
  }
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  if (!Array.isArray(posts) || posts.length === 0) {
    postsContainer.innerHTML = `<p>No posts yet</p>`;
    return;
  }

  posts.forEach((post) => {
    const col = document.createElement("div");
    col.className = "col-lg-12";

    const imgHtml = post.image
        ? `<img src="http://localhost:5000${post.image}" style="max-width:100%; border-radius:10px; margin:10px 0;" />`
        : "";

    const comments = Array.isArray(post.comments) ? post.comments : [];

    const commentsHtml = comments.length
        ? comments.map((c) => `
          <div style="padding:8px 10px; background:#f7f7f7; border-radius:10px; margin-top:6px; display:flex; justify-content:space-between; gap:10px;">
            <div>
              <div style="font-size:13px; color:#444;">
                <b>${escapeHtml(c.authorEmail || "anon")}</b>
                <span style="color:#888; font-size:12px;">
                  ${c.createdAt ? " • " + new Date(c.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <div style="margin-top:2px;">${escapeHtml(c.text || "")}</div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" data-del-comment="${c._id}">
              Delete
            </button>
          </div>
        `).join("")
        : `<div style="color:#777; font-size:13px; margin-top:6px;">No comments yet</div>`;

    col.innerHTML = `
      <div class="post-item">
        <div class="right-content">
          <span class="date">${post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</span>
          <h4>${escapeHtml(post.title || "")}</h4>
          ${imgHtml}
          <p>${escapeHtml(post.content || "")}</p>
          <small>By: ${escapeHtml(post.authorEmail || "unknown")}</small>

          <div style="margin-top:10px;">
            <button type="button" class="btn btn-warning btn-sm" data-edit="${post._id}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm ms-2" data-delete="${post._id}">Delete</button>
          </div>

          <!-- COMMENTS UI -->
          <div style="margin-top:16px; padding-top:12px; border-top:1px solid #eee;">
            <h6 style="margin:0 0 8px;">Comments (${comments.length})</h6>

            <div data-comments-list>
              ${commentsHtml}
            </div>

            <div style="display:flex; gap:8px; margin-top:10px;">
              <input type="text" class="form-control" placeholder="Write a comment..." data-comment-input />
              <button type="button" class="btn btn-primary" data-add-comment>Send</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // post buttons
    const delBtn = col.querySelector(`[data-delete="${post._id}"]`);
    const editBtn = col.querySelector(`[data-edit="${post._id}"]`);
    if (delBtn) delBtn.addEventListener("click", () => deletePost(post._id));
    if (editBtn) editBtn.addEventListener("click", () => editPost(post));

    // add comment
    const input = col.querySelector("[data-comment-input]");
    const addBtn = col.querySelector("[data-add-comment]");
    if (addBtn && input) {
      addBtn.addEventListener("click", async () => {
        const text = input.value.trim();
        if (!text) return alert("Comment text required");
        await addComment(post._id, text);
        input.value = ""; // ✅ очищаем после отправки
      });
    }

    // delete comment buttons
    col.querySelectorAll("[data-del-comment]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const commentId = btn.getAttribute("data-del-comment");
        if (!commentId) return;
        if (!confirm("Delete this comment?")) return;
        await deleteComment(post._id, commentId);
      });
    });

    postsContainer.appendChild(col);
  });
}

/* =======================
   DELETE POST
======================= */
async function deletePost(id) {
  const token = getToken();
  if (!token) return alert("Please login first");

  if (!confirm("Delete this post?")) return;

  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const data = await res.json();
  console.log("DELETE POST:", res.status, data);

  if (!res.ok) {
    alert(data.message || "Delete failed");
    return;
  }

  await loadPosts();
}

/* =======================
   UPDATE POST
======================= */
async function editPost(post) {
  const token = getToken();
  if (!token) return alert("Please login first");

  const newTitle = prompt("Edit title:", post.title || "");
  if (newTitle === null) return;

  const newContent = prompt("Edit content:", post.content || "");
  if (newContent === null) return;

  try {
    const res = await fetch(`${API_URL}/${post._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title: newTitle.trim(),
        content: newContent.trim(),
      }),
    });

    const data = await res.json();
    console.log("UPDATE POST:", res.status, data);

    if (!res.ok) {
      alert(data.message || "Update failed");
      return;
    }

    await loadPosts();
  } catch (err) {
    console.error("Update error:", err);
  }
}

/* =======================
   COMMENTS
======================= */
async function addComment(postId, text) {
  const token = getToken();
  if (!token) return alert("Please login first");

  const res = await fetch(`${API_URL}/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  console.log("ADD COMMENT:", res.status, data);

  if (!res.ok) {
    alert(data.message || "Add comment failed");
    return;
  }

  await loadPosts();
}

async function deleteComment(postId, commentId) {
  const token = getToken();
  if (!token) return alert("Please login first");

  const res = await fetch(`${API_URL}/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const data = await res.json();
  console.log("DELETE COMMENT:", res.status, data);

  if (!res.ok) {
    alert(data.message || "Delete comment failed");
    return;
  }

  await loadPosts();
}

/* =======================
   CREATE POST (with image)
======================= */
async function createPostWithImage(formEl) {
  const token = getToken();
  if (!token) return alert("Please login first");

  const title = formEl.title.value.trim();
  const content = formEl.content.value.trim();

  if (!title || !content) return alert("Title and content required");

  const fd = new FormData();
  fd.append("title", title);
  fd.append("content", content);

  const fileInput = document.getElementById("postImage");
  if (fileInput?.files?.[0]) {
    fd.append("image", fileInput.files[0]); // ✅ "image"
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: fd,
  });

  const data = await res.json();
  console.log("CREATE POST (FormData):", res.status, data);

  if (!res.ok) {
    alert(data.message || "Create failed");
    return;
  }

  formEl.reset();     // ✅ только после успеха
  await loadPosts();
}

/* =======================
   INIT
======================= */
document.addEventListener("DOMContentLoaded", () => {
  loadPosts();

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await createPostWithImage(form);
    });
  } else {
    console.warn("createPostForm not found");
  }
  accountLink.style.color = "#6b6cf5";
  accountLink.style.fontWeight = "600";

});
