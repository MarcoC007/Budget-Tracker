let db;
// create a db instance with the database connection
let request = window.indexedDB.open("budget", 1);

request.onupgradeneeded( function (event) {
    
    let db = event.target.result;

    db.createObjectStore("pending", { autoIncrement: true });
});

request.onsuccess = function (event) {

    db = event.target.result;

    console.log(event);

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    alert('Error on Database: ' + event.target.errorCode );
}

function checkDatabase() {

    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    const getAll = store.getAll();

    getAll.onsuccess = function ()  {
        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', { 
                method: 'PUT',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
            .then(() => {
               
                const transaction = db.transaction(["pending"], "readwrite");

                const store = transaction.objectStore("pending");
                
                //delete all pending object store
                store.clear();
            });
        };
    };


};

window.addEventListener('online', checkDatabase);