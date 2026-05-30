var db = null;
var currentUser = null;
var onUserChange = null;

function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(function (user) {
      currentUser = user;
      if (onUserChange) onUserChange(user);
    });
  } catch (e) {
    console.warn("Firebase init failed, using local storage", e);
  }
}

function signUp(email, password) {
  return firebase.auth().createUserWithEmailAndPassword(email, password);
}

function logIn(email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

function logOut() {
  return firebase.auth().signOut();
}

function getUserDoc() {
  if (!currentUser || !db) return null;
  return db.collection("users").doc(currentUser.uid);
}

function saveToCloud(records) {
  var doc = getUserDoc();
  if (!doc) return Promise.resolve();
  return doc.set({ records: records, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

function loadFromCloud() {
  var doc = getUserDoc();
  if (!doc) return Promise.resolve(null);
  return doc.get().then(function (snap) {
    if (snap.exists) return snap.data().records || [];
    return [];
  });
}

function deleteFromCloud(recordId) {
  // Records are stored as array, so just save the updated array
  return Promise.resolve();
}
