identityInfo = {}

async function init () {
  // Fetch the modal element
  let modal = new bootstrap.Modal("#createPost");
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  let forms = document.getElementsByClassName('needs-validation');
  // Loop over them and prevent submission
  let validation = Array.prototype.filter.call(forms, function(form) {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        showAlert("danger", "There was an error submitting your post.")
      } else { // If the form is valid
        event.preventDefault();
        postVideo()
          .then(modal.hide())
          .catch(error => console.log(error))
          .catch(modal.hide())
      }
      form.classList.add('was-validated');
    }, false);
  });

  let urlInput = document.getElementById("video-input");
  urlInput.onkeyup = previewVideo;
  urlInput.onchange = previewVideo;
  urlInput.onclick = previewVideo;

  identityInfo = await loadIdentity();
  loadPosts();
}

function showAlert (context, message) {
  // Fetch the main content element
  let alertBox = document.getElementById("alert-box");

  // Create the alert element and add the correct classes and role to it
  let alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  alertElement.classList.add("alert-dismissible");
  alertElement.classList.add("fade");
  alertElement.classList.add("show");
  alertElement.classList.add(`alert-${context}`);
  alertElement.role = "alert";

  let alertButton = document.createElement("button");
  alertButton.classList.add("btn-close");
  alertButton.setAttribute("data-bs-dismiss", "alert");
  alertButton.setAttribute("aria-label", "Close");

  // Add the message to the alert
  alertElement.textContent = message;

  alertElement.append(alertButton);

  // Append the alert to the alert box
  alertBox.append(alertElement);
}

async function loadPosts(){
  document.getElementById('your-profile-button').classList.remove("active")
  document.getElementById('home-button').classList.add("active")
  let sortOption = document.getElementById('sort-select').value;
  document.getElementById("pageContent").innerHTML = `
      <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
      </div>
  `;
  let postsJson = await fetchJSON(`api/post?sort=${sortOption}`);
  // Format the posts
  let postsHtml = formatPosts(postsJson);
  document.getElementById("pageContent").innerHTML = postsHtml;
  return;
}

function formatPosts(postsJson) {
  let postsHtml = postsJson.map(postInfo => {
    let deleteButton = myIdentity === postInfo.username ? `<button class="btn btn-sm btn-danger" onclick='deletePost("${postInfo.id}")'><i class="bi bi-trash"></i></button>` : '';
      return `
      <div class="col">
        <div class="card shadow-sm">
          <iframe
            src="https://www.youtube.com/embed/${escapeHTML(postInfo.videoData.id)}?modestbranding=1&rel=0"
            class="card-img-top"
            frameborder="0"
            width="560"
            height="315"
            allowfullscreen>
          </iframe>
          <div class="card-body">
            <h5 class="card-title">${escapeHTML(postInfo.videoData.snippet.title)}</h5>
            <p class="card-text">${escapeHTML(postInfo.description)}</p>
            <p class="card-text"><small class="text-body-secondary">${escapeHTML(numberWithCommas(postInfo.videoData.statistics.viewCount))} views</small></p>
            <div><a href="#" onclick="getProfile('${escapeHTML(postInfo.username)}')">${escapeHTML(postInfo.username)}</a>, ${(new Date(escapeHTML(postInfo.created_date))).toLocaleString("en-us", { dateStyle: "medium", timeStyle: "short" })}</div>
            <br>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                ${postInfo.likes && postInfo.likes.includes(myIdentity) ?
                  `<button type="button" class="btn btn-sm btn-secondary" onclick='unlikePost("${postInfo.id}", "${escapeHTML(postInfo.username)}")'><i class="bi bi-heart-fill"></i></button>` :
                  `<button type="button" class="btn btn-sm btn-outline-secondary" onclick='likePost("${postInfo.id}", "${escapeHTML(postInfo.username)}")' ${myIdentity? "": "disabled"}><i class="bi bi-heart"></i></button>`}
                <button title="${postInfo.likes? escapeHTML(postInfo.likes.join(", ")) : ""}" type="button" class="btn btn-sm btn-outline-secondary disabled">${postInfo.likes ? `${postInfo.likes.length}` : 0}</button>
              </div>
              <br>
              ${deleteButton}
              <button class="btn btn-sm btn-outline-secondary" onclick='toggleComments("${postInfo.id}")'>Show comments <i class="bi bi-chevron-down"></i></button>
            </div>
            <div id='comments-box-${postInfo.id}' class="comments-box d-none">
              <br>
              <button class="btn btn-sm btn-outline-secondary" onclick='refreshComments("${postInfo.id}")')><i class="bi bi-arrow-clockwise"></i></button>
              <div id='comments-${postInfo.id}'></div>
              <div class="input-group mb-3 new-comment-box ${myIdentity? "": "d-none"}">
                <input type="text" class="form-control" placeholder="Write a comment..." id="new-comment-${postInfo.id}"></textarea>
                <button class="btn btn-outline-secondary" onclick='postComment("${postInfo.id}")'>Post Comment</button>
              </div>
            </div>
          </div>
        </div>
      </div>`
  }).join("\n");

  return postsHtml
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

  try{
      await fetchJSON(`api/post`, {
          method: "POST",
          body: { url: url, description: description }
      })
  }catch(error){
      document.getElementById("postStatus").innerText = "Error"
      throw(error)
  }
  document.getElementById("video-input").value = "";
  document.getElementById("description-input").value = "";
  document.getElementById("video-preview").innerHTML = "";

  await loadPosts();
  showAlert("success", "Your post was successfully submitted!");

  return;
}

async function likePost(postID, postUsername){
  await fetchJSON(`api/post/like`, {
      method: "POST",
      body: {postID: postID}
  })

  if (!document.getElementById('home-button').classList.contains("active")) {
    getProfile(postUsername)
  } else {
    loadPosts();
  }

}


async function unlikePost(postID, postUsername){
  await fetchJSON(`api/post/unlike`, {
      method: "POST",
      body: {postID: postID}
  })

  if (!document.getElementById('home-button').classList.contains("active")) {
    getProfile(postUsername)
  } else {
    loadPosts();
  }
}

async function deletePost(postId){
  try {
    await fetch(`api/post/${postId}`, {
      method: "DELETE"
    });
    loadPosts();
    showAlert("success", "Post deleted successfully.");
  } catch (error) {
    showAlert("danger", "Error deleting post.");
  }
}

async function loadComments(postId) {
  const commentsDiv = document.getElementById(`comments-${postId}`);
  try {
    const comments = await fetchJSON(`api/comment?postID=${postId}`);
    const commentsHtml = comments.map(comment => `
      <div class="comment">
        <strong>${escapeHTML(comment.username)}:</strong>
        <p>${escapeHTML(comment.comment)}</p>
      </div>
    `).join("\n");
    commentsDiv.innerHTML = commentsHtml;
  } catch (error) {
    commentsDiv.innerHTML = "Failed to load comments.";
  }
}

async function postComment(postId) {
  const commentInput = document.getElementById(`new-comment-${postId}`);
  const commentText = commentInput.value;
  if (!commentText.trim()) return; // Prevent empty comments

  try {
    await fetchJSON(`api/comment`, {
      method: "POST",
      body: { newComment: commentText, postID: postId }
    });
    commentInput.value = ''; // Clear the input field
    loadComments(postId); // Reload comments to show the new one
  } catch (error) {
    showAlert("danger", "Failed to post comment.");
  }
}

function toggleComments(postId) {
  const commentsBox = document.getElementById(`comments-box-${postId}`);
  if (commentsBox.classList.contains("d-none")) {
    loadComments(postId); // Load comments when showing them
  }
  commentsBox.classList.toggle("d-none");
}

function refreshComments(postId) {
  loadComments(postId);
}

async function deleteComment(commentId, postId) {
  try {
    await fetch(`/api/comment/${commentId}`, { method: 'DELETE' });
    loadComments(postId);
    showAlert("success", "Comment deleted successfully.");
  } catch (error) {
    showAlert("danger", "Error deleting comment.");
  }
}

async function saveUserInfo(){
  let newBio = document.getElementById('editBio').value
  let responseJson = await fetchJSON(`api/user/profile`, {
      method: "POST",
      body: {username: identityInfo.userInfo.username, newBio: newBio}
  })
  getMyProfile()
  //TODO: do an ajax call to save whatever info you want about the user from the user table
  //see postComment() in the index.js file as an example of how to do this
}

function getMyProfile() {
  getProfile(identityInfo.userInfo.username)
  document.getElementById('your-profile-button').classList.add("active")
}

async function getProfile(username) {
  document.getElementById('home-button').classList.remove("active")
  const content = document.getElementById('pageContent')
  const info = await fetchJSON(`api/user/profile?username=${username}`)
  let postsJson = await fetchJSON(`api/post?username=${encodeURIComponent(username)}`)
  const postHTML = formatPosts(postsJson)
  let bio = info.bio ?? `${info.username} has not set up their bio yet`
  let divClass = "d-none"

  if ("userInfo" in identityInfo) {
    if(identityInfo.userInfo.username === username) {
      divClass = ""
    }
  }

  content.innerHTML = `
  <div>
    <h3>${info.name} (${info.username})</h3>
    <p>Bio: ${bio}</p>
    <p>Last Login: ${(new Date(info.lastLogin)).toLocaleString()}</p>
  </div>
    <div id="user_info_new_div" class="${divClass}">
    <h3>Update User Info:</h3>
    <input type="text" id="editBio" name="bio" placeholder="Edit Bio">
    <br>
    <button onclick="saveUserInfo()">Save User Info</button>
  </div>
  <div>
    <h3>Videos Shared by ${info.name}</h3>
    ${postHTML}
  </div>`

}

