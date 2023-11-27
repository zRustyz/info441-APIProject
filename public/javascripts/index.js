async function init(){
  await loadIdentity();
  loadPosts();
}

async function loadPosts(){
  document.getElementById("pageContent").innerText = "Loading...";
  let postsJson = await fetchJSON(`api/post`)

  let postsHtml = postsJson.map(postInfo => {
      return `
      <div class="post">
          ${escapeHTML(postInfo.description)}
          ${postInfo.htmlPreview}
          <div><a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}</div>
          <div class="post-interactions">
              <div>
                  <span title="${postInfo.likes? escapeHTML(postInfo.likes.join(", ")) : ""}"> ${postInfo.likes ? `${postInfo.likes.length}` : 0} likes </span> &nbsp; &nbsp;
                  <span class="heart-button-span ${myIdentity? "": "d-none"}">
                      ${postInfo.likes && postInfo.likes.includes(myIdentity) ?
                          `<button class="heart_button" onclick='unlikePost("${postInfo.id}")'>&#x2665;</button>` :
                          `<button class="heart_button" onclick='likePost("${postInfo.id}")'>&#x2661;</button>`}
                  </span>
              </div>
              <br>
              <button onclick='toggleComments("${postInfo.id}")'>View/Hide comments</button>
              <div id='comments-box-${postInfo.id}' class="comments-box d-none">
                  <button onclick='refreshComments("${postInfo.id}")')>refresh comments</button>
                  <div id='comments-${postInfo.id}'></div>
                  <div class="new-comment-box ${myIdentity? "": "d-none"}">
                      New Comment:
                      <textarea type="textbox" id="new-comment-${postInfo.id}"></textarea>
                      <button onclick='postComment("${postInfo.id}")'>Post Comment</button>
                  </div>
              </div>
          </div>
      </div>`
  }).join("\n");
  document.getElementById("pageContent").innerHTML = postsHtml;
}

