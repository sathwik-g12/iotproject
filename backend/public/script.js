// TOKEN FUNCTIONS
function getToken() {
  return localStorage.getItem("token");
}

function setToken(t) {
  localStorage.setItem("token", t);
}

// API GET
async function apiGet(path) {
  const res = await fetch("/api" + path, {
    headers: { "Authorization": "Bearer " + getToken() }
  });

  return res.json();
}

// API POST
async function apiPost(path, body) {
  const res = await fetch("/api" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return res.json();
}
