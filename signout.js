const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "/index.html";
  } else {
    document.getElementById("userEmail").textContent = `Logged in as: ${user.email}`;
  }
});

document.getElementById("signOutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "/index.html";
  }).catch((error) => {
    console.error("Sign Out Error", error);
  });
});
