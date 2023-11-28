async function init(){
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.getElementsByClassName('needs-validation');
  // Loop over them and prevent submission
  var validation = Array.prototype.filter.call(forms, function(form) {
    form.addEventListener('submit', function(event) {
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        postVideo();
      }
      form.classList.add('was-validated');
    }, false);
  });


  let urlInput = document.getElementById("video-input");
  urlInput.onkeyup = previewVideo;
  urlInput.onchange = previewVideo;
  urlInput.onclick = previewVideo;

  await loadIdentity();
  loadPosts();
}

async function loadPosts(){
  document.getElementById("pageContent").innerHTML = `
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  `;
  let postsJson = await fetchJSON(`api/post`)
  // Format the posts
  let postsHtml = postsJson.map(postInfo => {
      return `
      <div class="col">
        <div class="card shadow-sm">
          <a href="https://www.youtube.com/watch?v=${escapeHTML(postInfo.videoData.id)}" target="_blank" rel="noopener noreferrer">
            <img src="${escapeHTML(postInfo.videoData.snippet.thumbnails.high.url)}" class="card-img-top">
          </a>
          <div class="card-body">
            <h5 class="card-title">${escapeHTML(postInfo.videoData.snippet.title)}</h5>
            <p class="card-text">${escapeHTML(postInfo.description)}</p>
            <p class="card-text"><small class="text-body-secondary">${escapeHTML(numberWithCommas(postInfo.videoData.statistics.viewCount))} views</small></p>
            <div><a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}</div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                ${postInfo.likes && postInfo.likes.includes(myIdentity) ?
                  `<button type="button" class="btn btn-sm btn-outline-secondary" onclick='unlikePost("${postInfo.id}")'>❤️</button>` :
                  `<button type="button" class="btn btn-sm btn-outline-secondary" onclick='likePost("${postInfo.id}")' ${myIdentity? "": "disabled"}>❤️</button>`}
                <button title="${postInfo.likes? escapeHTML(postInfo.likes.join(", ")) : ""}" type="button" class="btn btn-sm btn-outline-secondary disabled">${postInfo.likes ? `${postInfo.likes.length}` : 0}</button>
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
              if (previewHtml) {
                document.getElementById("post-button").removeAttribute("disabled");
              } else {
                document.getElementById("post-button").setAttribute("disabled", "disabled");
              }
          }catch(error){
              document.getElementById("video-preview").innerHTML = "There was an error: " + error;
          }
      }
  }
}

async function postVideo(){
  document.getElementById("postStatus").innerHTML = "sending data..."
  let url = document.getElementById("video-input").value;
  let description = document.getElementById("description-input").value;
  let category = document.getElementById("category-select").value;

  try{
      await fetchJSON(`api/post`, {
          method: "POST",
          body: { url: url, description: description, category: category }
      })
  }catch(error){
      document.getElementById("postStatus").innerText = "Error"
      throw(error)
  }
  document.getElementById("video-input").value = "";
  document.getElementById("description-input").value = "";
  document.getElementById("video-preview").innerHTML = "";
  document.getElementById("postStatus").innerHTML = "successfully uploaded"
  loadPosts();

}