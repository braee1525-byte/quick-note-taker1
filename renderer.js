<<<<<<< HEAD
window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const saveAsBtn = document.getElementById('saveAs');
    const newNoteBtn = document.getElementById('newNote');
    const openBtn = document.getElementById('openFile');
    const deleteBtn = document.getElementById('deleteBtn');
    const statusEl = document.getElementById('status');

    // Load saved note on startup
    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;

    let lastSavedText = textarea.value;
    let currentFilePath = null;

    // =========================
    // AUTO SAVE FUNCTION
    // =========================
    async function autoSave() {
        const currentText = textarea.value;

        if (currentText === lastSavedText) {
            statusEl.textContent = 'No changes to save';
            return;
        }

        try {
            await window.electronAPI.smartSave(currentText, currentFilePath);
            lastSavedText = currentText;

            const now = new Date().toLocaleTimeString();
            statusEl.textContent = `Auto-saved at ${now}`;
            statusEl.style.color = 'green';
        } catch (err) {
            console.error('Auto-save failed:', err);
            statusEl.textContent = 'Auto-save error!';
            statusEl.style.color = 'red';
        }
    }

    // =========================
    // DEBOUNCE LISTENER
    // =========================
    let debounceTimer;

    textarea.addEventListener('input', () => {
        statusEl.textContent = 'Changes detected — auto-saving in 5s...';
        statusEl.style.color = 'orange';

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(autoSave, 5000);
    });

    // =========================
    // SAVE BUTTON
    // =========================
    saveBtn.addEventListener('click', async () => {
        await window.electronAPI.saveNote(textarea.value);
        alert("Note saved successfully");
    });

    // =========================
    // SAVE AS BUTTON (FIXED)
    // =========================
    saveAsBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.saveAs(textarea.value);

            if (result && result.success) {
                currentFilePath = result.filePath;
                lastSavedText = textarea.value;

                statusEl.textContent = `Saved to: ${result.filePath}`;
                statusEl.style.color = 'green';
            } else {
                statusEl.textContent = 'Your note is saved';
                statusEl.style.color = 'orange';
            }
        } catch (err) {
            console.error('Save As failed:', err);
            statusEl.textContent = 'Save As failed!';
            statusEl.style.color = 'red';
        }
    });

    // =========================
    // NEW NOTE BUTTON
    // =========================
    newNoteBtn.addEventListener('click', async () => {
        if (textarea.value === lastSavedText) {
            textarea.value = '';
            currentFilePath = null;
            return;
        }

        const confirmed = await window.electronAPI.newNote();

        if (confirmed) {
            textarea.value = '';
            currentFilePath = null;
            lastSavedText = '';
        }
    });

    // =========================
    // OPEN FILE BUTTON
    // =========================
    openBtn.addEventListener('click', async () => {
        try {
            const result = await window.electronAPI.openFile();

            if (result) {
                textarea.value = result.content;
                currentFilePath = result.filePath;
                lastSavedText = result.content;

                statusEl.textContent = 'File opened!';
                statusEl.style.color = 'green';
            }
        } catch (err) {
            console.error('Open file failed:', err);
            statusEl.textContent = 'Open failed!';
            statusEl.style.color = 'red';
        }
    });

    // =========================
    // DELETE BUTTON
    // =========================
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Really delete ALL notes? This cannot be undone!')) {
            try {
                await window.electronAPI.deleteNote();
                textarea.value = '';
                lastSavedText = '';
                currentFilePath = null;

                statusEl.textContent = 'All notes deleted!';
                statusEl.style.color = 'red';
            } catch (err) {
                console.error('Delete failed:', err);
                statusEl.textContent = 'Delete failed!';
            }
        }
=======
window.addEventListener('DOMContentLoaded', async() => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');

    const savedNote= await window.electronAPI.loadNote();
    textarea.value= savedNote;
    let lastSavedText =textarea.value;

    saveBtn.addEventListener('click',async () => {
        await window.electronAPI.saveNote(textarea.value);
        alert('Note saved successfully!')
>>>>>>> 5c2a99e33e2a2fc701c493d09b6d63b5b8f1f06d
    });
    const saveAsBtn = document.getElementById('save-as');

saveAsBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.saveAs(textarea.value);

  if (result.success) {
    lastSavedText = textarea.value;
    statusEl.textContent = `Saved to: ${result.filePath}`;
    statusEl.style.color = 'green';
  } else {
    statusEl.textContent = 'Save As cancelled.';
    statusEl.style.color = 'red';
  }
});


const newNoteBtn = document.getElementById('new-note');

newNoteBtn.addEventListener('click', async () => {

  if (textarea.value === lastSavedText) {
    textarea.value = '';
    lastSavedText = '';
    statusEl.textContent = 'New note started.';
    return;
  }


  const result = await window.electronAPI.newNote();

  if (result) { 
    textarea.value = '';
    lastSavedText = '';
    statusEl.textContent = 'New note started.';
  } else {
    statusEl.textContent = 'New note cancelled.';
  }
});

const openFileBtn = document.getElementById('open-file');

openFileBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openFile();

  if (result.success) {
    textarea.value = result.content;
    lastSavedText = result.content;
    currentFilePath = result.filePath;
    statusEl.textContent = `Opened: ${result.filePath}`;
  } else {
    statusEl.textContent = 'Open cancelled.';
  }
});


    const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener('click', async () => {
  if (confirm('Really delete ALL notes? This cannot be undone!')) {
    try {
      await window.electronAPI.deleteNote();
      textarea.value = '';        
      lastSavedText = '';
      statusEl.textContent = 'All notes deleted!';
      statusEl.style.color = 'red';
    } catch (err) {
      alert('Delete failed!');
    }
  }
  async function autoSave() {
  const currentText = textarea.value;

  if (currentText === lastSavedText) {
    statusEl.textContent = 'No changes to save';
    return;
  }

  try {
    await window.electronAPI.saveNote(currentText);
    lastSavedText = currentText;

    const now = new Date().toLocaleTimeString();
    statusEl.textContent = `Auto-saved at ${now}`;
  } catch (err) {
    console.error('Auto-save failed:', err);
    statusEl.textContent = 'Auto-save error!';
  }
}

});


});