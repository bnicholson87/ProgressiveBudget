let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    // create object store called "pending" to increment the ID process
   const db = event.target.result;
   db.createObjectStore("pending", { autoIncrement: true });
 };

 
 // check to see if user is online
 request.onsuccess = function(event) {
    db = event.target.result;
 if (navigator.onLine) {
    checkDatabase();
  }
};

// if error, console log alerts user
request.onerror = function(event) {
    console.log("Error occurred " + event.target.errorCode);
  };

  
  // save what the user is doing
  function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
};

function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("pending");
    // get all records from store and set to a variable
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response =>{return response.json()})
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
  
          // access your pending object store
          const store = transaction.objectStore("pending");
  
          // clear all items in your store
          store.clear();
        });
      }
    };
  };

  // check to see if user is back online
  window.addEventListener("online", checkDatabase);

  