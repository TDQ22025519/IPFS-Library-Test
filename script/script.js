import { create } from 'https://cdn.jsdelivr.net/npm/@web3-storage/w3up-client@16.4.1/dist/src/index.js/+esm';
import { RemoteStorage } from 'https://cdn.jsdelivr.net/npm/remote-storage@1.0.7/+esm'

const remoteStorage = new RemoteStorage({
    serverAddress: 'https://api.remote.storage',
    userId: '123e4567-e612-12d3-a456-0974428634',
    instanceId: 'nhom7-ipfs-app'
})

// Load books when the page is loaded
window.onload = loadBooks;


const client = await create();
const myAccount = await client.login('dangquang22082004@gmail.com');
const space = client.currentSpace('Storage');
await myAccount.provision(space.did());
await client.setCurrentSpace(space.did());

// Function to load books from remoteStorage
async function loadBooks() {
    document.getElementById('loading').style.display = 'block'; // Show the loading spinner
    const storageFetchItem = await remoteStorage.getItem('books');
    const books = storageFetchItem || [];
    document.getElementById('loading').style.display = 'none'; // Hide the loading spinner
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = ''; // Clear the list before adding
    books.forEach((book, index) => {
        const newBook = document.createElement('li');
        const downloadLink = document.createElement('a');
        downloadLink.textContent = `${book.name} by ${book.author}`;
        downloadLink.href = book.link;
        downloadLink.download = ''; // This attribute suggests that the browser should download the file instead of navigating to it

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = async () => {
            await deleteBook(index); // Call the delete function with the index of the book
        };


        // Append the anchor to the list item
        newBook.appendChild(downloadLink);
        newBook.appendChild(deleteButton);
        bookList.appendChild(newBook);
    });
}


// Function to add a book
document.getElementById("add-book").onclick = async function () {
    const bookName = document.getElementById('bookName').value;
    const authorName = document.getElementById('authorName').value;
    const bookFile = document.getElementById('bookFile').files[0]; // Get the uploaded file
    // Check if all fields are filled
    if (bookName && authorName && bookFile) {
        document.getElementById("add-book").disabled = true;
        document.getElementById('loading').style.display = 'block'; // Show the loading spinner
        const files = [bookFile];
        const directoryCid = await client.uploadDirectory(files);
        const downloadLink = 'https://' + directoryCid + '.ipfs.w3s.link/' + bookFile.name;
        const books = await remoteStorage.getItem('books') || [];
        books.push({ name: bookName, author: authorName, link: downloadLink }); // Store file name or path
        await remoteStorage.setItem('books', JSON.stringify(books));
        loadBooks(); // Refresh the book list
        
        // Clear input fields
        document.getElementById('bookName').value = '';
        document.getElementById('authorName').value = '';
        document.getElementById('bookFile').value = ''; // Clear file input
        document.getElementById("add-book").disabled = false;
        document.getElementById('loading').style.display = 'none'; // Hide the loading spinner
    } else {
        alert("Please enter book name, author name, and upload a file.");
    }
}

document.getElementById("load-library").onclick = async function () {
    document.getElementById("load-library").disabled = true;
    loadBooks();
    document.getElementById("load-library").disabled = false;
}

// Function to clear the library
document.getElementById("clear-library").onclick = async function () {
    document.getElementById("load-library").disabled = true;
    document.getElementById('loading').style.display = 'block'; // Show the loading spinner
    await remoteStorage.removeItem('books'); // Clear the specific item
    document.getElementById('loading').style.display = 'none'; // Hide the loading spinner
    loadBooks(); // Refresh the book list
    document.getElementById("load-library").disabled = false;
}

// Function to delete a book
async function deleteBook(index) {
    document.getElementById('loading').style.display = 'block'; // Show the loading spinner
    const books = await remoteStorage.getItem('books') || [];
    books.splice(index, 1); // Remove the book at the specified index
    await remoteStorage.setItem('books', JSON.stringify(books)); // Update the remoteStorage
    loadBooks(); // Refresh the book list
    document.getElementById('loading').style.display = 'none'; // Hide the loading spinner
}
