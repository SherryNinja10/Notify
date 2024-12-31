const logout = document.getElementById('logout');

logout.addEventListener('click', async () => {
    await fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    window.location.href = '/login';
});

const username = document.getElementById('username');

async function getUsername() {
    const response = await fetch('/username', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (response.ok) {
        username.innerText = result[0].username;
    } else {
        window.location.href = '/login';
    }
}

getUsername()

const editUsername = document.getElementById('editUsername');

editUsername.addEventListener('click', async () => {
    const newUsername = prompt('Enter new username');

    if (newUsername) {
        await fetch('/editUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newUsername }),
        });

        getUsername();
    }
});

const notes = document.getElementById('notesField');

async function getNotes() {

    const response = await fetch('/notes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const text = await response.text();
        const result = text ? JSON.parse(text) : {};
        if (result.length === 0) {
            notes.innerText = "No notes found";
        } else {
            notes.innerHTML = '';

            result.forEach((note) => {
                const noteContainer = document.createElement('div');
                noteContainer.className = 'noteAndOptions';
                const noteElement = document.createElement('p');
                noteElement.innerText = note.note;
                const editButton = document.createElement('button');
                editButton.id = 'editNote' + note.noteID;
                editButton.type = 'button';
                editButton.innerText = 'Edit';
                const deleteButton = document.createElement('button');
                deleteButton.id = 'deleteNote' + note.noteID;
                deleteButton.type = 'button';
                deleteButton.innerText = 'Delete';
                noteContainer.appendChild(noteElement);
                noteContainer.appendChild(editButton);
                noteContainer.appendChild(deleteButton);
                notes.appendChild(noteContainer);

                editButton.addEventListener('click', async () => {
                    const newNote = prompt('Enter new note');

                    if (newNote) {
                        if (newNote.length === 0) {
                            alert('Note cannot be empty');
                            return;
                        } else if (newNote.length > 100) {
                            alert('Note cannot be longer than 100 characters');
                            return;
                        } else {
                            await fetch('/editNote', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ newNote, noteID: note.noteID }),
                            });

                            getNotes();
                        }
                    }
                });                
            });
        }
    } else {
        console.log('Failed to get noted');
    }
}

getNotes();

const addNote = document.getElementById('newNote');

addNote.addEventListener('click', async () => {
    const note = prompt('Enter new note');

    if (note) {
        if (note.length === 0) {
            alert('Note cannot be empty');
            return;
        } else if (note.length > 100) {
            alert('Note cannot be longer than 100 characters');
            return;
        } else {
            await fetch('/addNote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ note }),
        });

        getNotes();
        }
    }
});