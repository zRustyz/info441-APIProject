async function init(){
  let urlInput = document.getElementById("video-input");
  urlInput.onkeyup = previewVideo;
  urlInput.onchange = previewVideo;
  urlInput.onclick = previewVideo;

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

let lastTypedUrl = ""
let lastTypedTime = Date.now();
let lastVideoPreviewed = "";
async function previewVideo(){
  // document.getElementById("postStatus").innerHTML = "";
  let url = document.getElementById("video-input").value;

  // make sure we are looking at a new url (they might have clicked or something, but not changed the text)
  if (url != lastTypedUrl) {

    //In order to not overwhelm the server,
    // if we recently made a request (in the last 0.5s), pause in case the user is still typing
    lastTypedUrl = url;
    let timeSinceLastType = Date.now() - lastTypedTime
    lastTypedTime = Date.now()
    if(timeSinceLastType < 500){
      await new Promise(r => setTimeout(r, 1000)) // wait 1 second
    }
    // if after pausing the last typed url is still our current url, then continue
    // otherwise, they were typing during our 1 second pause and we should stop trying
    // to preview this outdated url
    if(url != lastTypedUrl){
      return;
    }

      if(url != lastVideoPreviewed) { // make sure this isn't the one we just previewd
        lastVideoPreviewed = url; // mark this url as one we are previewing
          document.getElementById("video-preview").innerHTML = "Loading preview..."
          try{
              let response = await fetch(`api/video/preview?url=${url}`);
              let previewHtml = await response.text();
              if (url == lastVideoPreviewed) {
                  document.getElementById("video-preview").innerHTML = previewHtml;
              }
          }catch(error){
              document.getElementById("video-preview").innerHTML = "There was an error: " + error;
          }
      }
  }
}