let myIdentity = undefined;

async function loadIdentity(){
  let identity_div = document.getElementById("identity-div");

  try {
    let identityInfo = await fetchJSON(`api/user/myIdentity`)

    if(identityInfo.status == "loggedin") { // logged in
      myIdentity = identityInfo.userInfo.username;
      identity_div.innerHTML = `
      <a href="/userInfo.html?user=${encodeURIComponent(identityInfo.userInfo.username)}">${escapeHTML(identityInfo.userInfo.name)} (${escapeHTML(identityInfo.userInfo.username)})</a>
      <a href="signout" class="btn btn-danger" role="button">Log out</a>`;
      if(document.getElementById("make_post_div")){
        document.getElementById("make_post_div").classList.remove("d-none");
      }
      // Enable the create post button
      document.getElementById("your-profile-button").classList.remove("disabled");
      document.getElementById("your-profile-button").classList.add("text-white");
      document.getElementById("your-profile-button").ariaDisabled = false;
      document.getElementById("create-post-button").classList.remove("disabled");
      document.getElementById("create-post-button").classList.add("text-white");
      document.getElementById("create-post-button").ariaDisabled = false;
      Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.remove("d-none"))
      Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.remove("d-none"));
    } else { // logged out
      myIdentity = undefined;
      identity_div.innerHTML = `
      <a href="signin" class="btn btn-primary" role="button">Sign in</a>`;
      if(document.getElementById("make_post_div")){
        document.getElementById("make_post_div").classList.add("d-none");
      }
      Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.add("d-none"))
      Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.add("d-none"));
    }
    return await identityInfo;
  } catch(error) {
    myIdentity = undefined;
    identity_div.innerHTML = `<div>
    <button onclick="loadIdentity()">retry</button>
    Error loading identity: <span id="identity_error_span"></span>
    </div>`;
    document.getElementById("identity_error_span").innerText = error;
    if(document.getElementById("make_post_div")){
      document.getElementById("make_post_div").classList.add("d-none");
    }
    Array.from(document.getElementsByClassName("new-comment-box")).forEach(e => e.classList.add("d-none"));
    Array.from(document.getElementsByClassName("heart-button-span")).forEach(e => e.classList.add("d-none"));
  }
}
