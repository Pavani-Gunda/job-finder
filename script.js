import { db, collection, addDoc, onSnapshot, serverTimestamp, storage, ref, uploadBytes, getDownloadURL } from './firebase-config.js';
import{ getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './auth.js';
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import{doc,collection,setDoc,deleteDoc,onSnapshot} from "firebase/firestore";
import{doc,setDoc,deleteDoc,getDoc,onSnapshot,collection} from "firebase/firestore";
import { collection,addDoc,serverTimestamp,query,doc,onSnapshot,orderBy } from 'firebase/firestore';

const postDescription = document.getElementById("postDescription");
const fileInput = document.getElementById("fileInput");
const submitPostBtn = document.getElementById("submitPostBtn");
const postsContainer = document.getElementById("postsContainer");

const provider = new GoogleAuthProvider();

submitPostBtn.addEventListener("click", async () => {
  const text = postDescription.value.trim();
  const file = fileInput.files[0];

  let mediaURL = "";
  let mediaType = "";

  if (file) {
    const fileRef = ref(storage, `posts/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    mediaURL = await getDownloadURL(fileRef);
    mediaType = file.type.startsWith("image") ? "image" : "video";
  }

  await addDoc(collection(db, "posts"), {
    text,
    mediaURL,
    mediaType,
    createdAt: serverTimestamp(),
    user: {
      name: "Pavani G", // Replace with current user's name
      avatar: "/images/201634.png" // Replace with user's profile image
    }
  });

  postDescription.value = "";
  fileInput.value = "";
  document.getElementById("postModal").style.display = "none";
});

function loadPosts() {
  const q = collection(db, "posts");
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const post = doc.data();
      const postId = doc.id;
      const postDiv = document.createElement("div");
      postDiv.className = "post";

      postDiv.innerHTML = `
        <div class="post-header">
          <div><img src="${post.user.avatar}" alt="User" style="width: 30px; vertical-align: middle;"> <strong>${post.user.name}</strong></div>
          <small>${post.createdAt?.toDate().toLocaleString() || "Just now"}</small>
        </div>
        <p>${post.text}</p>
        ${post.mediaURL ? post.mediaType === "image" ? `<img src="${post.mediaURL}" style="max-width:100%;">` : `<video src="${post.mediaURL}" controls style="max-width:100%;"></video>` : ""}
        <div class="interaction">
          <button class="like-btn">👍 Like (<span class="like-count">0</span>)</button>
          <button class="comment-toggle-btn">💬 Comment</button>
        </div>
        <div class="comment-section" style="display:none;">
          <input type="text" placeholder="Write a comment..." class="comment-input">
          <div class="comment-list"></div>
        </div>
        `;
if (post.userId === auth.currentUser.uid) {
  postDiv.innerHTML += `
    <div class="post-controls">
      <button class="edit-post">✏️</button>
      <button class="delete-post">🗑️</button>
    </div>
  

`;
};
//edit and deletepost
const editBtn = postDiv.querySelector(".edit-post");
const deleteBtn = postDiv.querySelector(".delete-post");

if (editBtn) {
  editBtn.addEventListener("click", () => {
    const newText = prompt("Edit your post:", post.text);
    if (newText) {
      updateDoc(doc(db, "posts", postId), { text: newText });
    }
  });
}

if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    if (confirm("Delete this post?")) {
      deleteDoc(doc(db, "posts", postId));
    }
  });
}
      // Setup like button
      postsContainer.prepend(postDiv);
      setupPostInteractions(postDiv);
    });
  });
}

loadPosts();


//auth.js
window.login = async function(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert(e.message);
  }
};

window.register = async function(email, password, name) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      avatar: "/images/user.svg",
      createdAt: new Date()
    });
  } catch (e) {
    alert(e.message);
  }
};

window.loginWithGoogle = async function() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check if user exists in Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
      createdAt: new Date()
    });
  }
};

window.handleSignOut = async function() {
  await signOut(auth);
  location.reload();
};

// Check auth status
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in:", user.email);
    document.getElementById("user-name").textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
    document.getElementById("user-photo").style.backgroundImage = `url(${user.photoURL || '/images/user.svg'})`;
  } else {
    window.location.href = "/like.html"; // Or show login modal
  }
});



//comments
function setupPostInteractions(postDiv, postId) {
  const commentToggle = postDiv.querySelector(".comment-toggle-btn");
  const commentSection = postDiv.querySelector(".comment-section");
  const commentInput = postDiv.querySelector(".comment-input");
  const commentList = postDiv.querySelector(".comment-list");

  // Toggle visibility
  commentToggle.addEventListener("click", () => {
    commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
  });

  // Listen for comment submit
  commentInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && commentInput.value.trim() !== "") {
      const text = commentInput.value.trim();
      const commentRef = collection(db, "posts", postId, "comments");
      await addDoc(commentRef, {
        text,
        user: {
          name: "You",
          avatar: "/images/user.svg"
        },
        createdAt: serverTimestamp()
      });
      commentInput.value = "";
    }
  });

  // Load comments in real time
  const commentRef = collection(db, "posts", postId, "comments");
  onSnapshot(commentRef, (snapshot) => {
    commentList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const commentEl = document.createElement("div");
      commentEl.className = "comment";
      commentEl.innerHTML = `
        <div class="comment-user"><img src="${data.user.avatar}" alt="" /> <strong>${data.user.name}</strong></div>
        <p>${data.text}</p>
        <small>${data.createdAt?.toDate().toLocaleString() || "Just now"}</small>
      `;
      commentList.appendChild(commentEl);
    });
  });
}

//logic collection
function setupLikeButton(postDiv, postId, user) {
  const likeBtn = postDiv.querySelector(".like-btn");
  const likeCount = postDiv.querySelector(".like-count");
  const likeRef = collection(db, "posts", postId, "likes");
  const userLikeDoc = doc(likeRef, user.uid);

  // Real-time like count
  onSnapshot(likeRef, (snapshot) => {
    likeCount.textContent = snapshot.size;
  });

  // Toggle like
  likeBtn.addEventListener("click", async () => {
    const docSnap = await getDoc(userLikeDoc);
    if (docSnap.exists()) {
      await deleteDoc(userLikeDoc); // Unlike
    } else {
      await setDoc(userLikeDoc, {
        name: user.displayName || "Anonymous",
        avatar: user.photoURL || "/images/user.svg",
        createdAt: new Date()
      }); // Like
    }
  });
}
//setupfollowbutton
function setupFollowButton(button, userId) {
  const followRef = doc(db, "users", auth.currentUser.uid, "follows", userId);

  // Check if already following
  getDoc(followRef).then(docSnap => {
    if (docSnap.exists()) {
      button.textContent = "Unfollow";
    }
  });

  // Toggle follow
  button.addEventListener("click", async () => {
    const docSnap = await getDoc(followRef);
    if (docSnap.exists()) {
      await deleteDoc(followRef);
      button.textContent = "Follow";
    } else {
      await setDoc(followRef, {
        name: "Name Here", // You can pass the target user info
        avatar: "/images/user.svg",
        followedAt: new Date()
      });
      button.textContent = "Unfollow";
    }
  });
}
const followBtn = postDiv.querySelector(".follow-btn");
if (followBtn) {
  const userId = followBtn.getAttribute("data-userid");
  setupFollowButton(followBtn, userId);
}

//chatbox


let currentChatUserId = null;

function openChatWith(userId, userName) {
  currentChatUserId = userId;
  document.getElementById("chatModal").style.display = "block";
  document.getElementById("chatUserName").textContent = userName;
  loadMessages(userId);
}

function loadMessages(receiverId) {
  const chatId = [auth.currentUser.uid, receiverId].sort().join("_");
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));

  onSnapshot(q, (snapshot) => {
    const chatBox = document.getElementById("chatMessages");
    chatBox.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const messageEl = document.createElement("div");
      messageEl.className = msg.senderId === auth.currentUser.uid ? "my-message" : "their-message";
      messageEl.textContent = msg.text;
      chatBox.appendChild(messageEl);
    });
  });
}

document.getElementById("sendMessageBtn").addEventListener("click", async () => {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  const chatId = [auth.currentUser.uid, currentChatUserId].sort().join("_");
  const messagesRef = collection(db, "chats", chatId, "messages");

  await addDoc(messagesRef, {
    senderId: auth.currentUser.uid,
    receiverId: currentChatUserId,
    text,
    createdAt: serverTimestamp()
  });

  input.value = "";
});
// post job
function postJob() {
  const job = {
    title: document.getElementById("jobTitle").value,
    company: document.getElementById("jobCompany").value,
    location: document.getElementById("jobLocation").value,
    description: document.getElementById("jobDesc").value,
    userId: auth.currentUser.uid,
    createdAt: new Date()
  };

  addDoc(collection(db, "jobs"), job)
    .then(() => alert("Job posted!"));
}
function loadJobs() {
  const container = document.getElementById("jobsContainer");
  onSnapshot(collection(db, "jobs"), snapshot => {
    container.innerHTML = "";
    snapshot.forEach(doc => {
      const job = doc.data();
      container.innerHTML += `
        <div class="job-card">
          <h4>${job.title}</h4>
          <p>${job.company} – ${job.location}</p>
          <p>${job.description}</p>
          <button onclick="applyToJob('${doc.id}')">Apply</button>
        </div>
      `;
    });
  });
}

function applyToJob(jobId) {
  addDoc(collection(db, "applications"), {
    jobId,
    userId: auth.currentUser.uid,
    appliedAt: new Date()
  }).then(() => {alert("Applied to job!")
sendNotification(posterId,"You have a new job application!");
 });
}

loadJobs();

// send notification
function sendNotification(userId, text) {
  const ref = collection(db, "users", userId, "notifications");
  addDoc(ref, {
    text,
    read: false,
    createdAt: new Date()
  });
}
sendNotification(auth.currentUser.uid, "You have a new message!");

function showNotifications() {
  const notifRef = collection(db, "users", auth.currentUser.uid, "notifications");
  onSnapshot(notifRef, snapshot => {
    const container = document.getElementById("notifications");
    container.innerHTML = "";
    snapshot.forEach(doc => {
      const n = doc.data();
      container.innerHTML += `<div class="notif">${n.text}</div>`;
    });
  });
}
showNotifications();

