window.addEventListener('DOMContentLoaded', async () => {

    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const saveAsBtn = document.getElementById('saveAs');
    const newNoteBtn = document.getElementById('newNote');
    const openBtn = document.getElementById('openFile');
    const deleteBtn = document.getElementById('deleteBtn');
    const statusEl = document.getElementById('status');

    // Load saved note
    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;

    let lastSavedText = textarea.value;
    let currentFilePath = null;

    // =========================
    // AUTO SAVE
    // =========================
    async function autoSave() {

        const currentText = textarea.value;

        if (currentText === lastSavedText) {
            statusEl.textContent = 'No changes to save';
            return;
        }

        try {

            if (currentFilePath) {
                await window.electronAPI.smartSave(
                    currentText,
                    currentFilePath
                );
            } else {
                await window.electronAPI.saveNote(currentText);
            }

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
    // DEBOUNCE AUTO SAVE
    // =========================
    let debounceTimer;

    textarea.addEventListener('input', () => {

        statusEl.textContent =
            'Changes detected — auto-saving in 5s...';

        statusEl.style.color = 'orange';

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(autoSave, 5000);
    });

    // =========================
    // SAVE BUTTON
    // =========================
    saveBtn.addEventListener('click', async () => {
  try {
    const result = await window.electronAPI.smartSave(textarea.value, currentFilePath);
    lastSavedText = textarea.value;
    currentFilePath = result.filePath;
    statusEl.textContent = `Saved to: ${result.filePath}`;
  } catch (err) {
    console.error('Save failed:', err);
    statusEl.textContent = 'Save failed!';
  }
});
    // =========================
    // SAVE AS BUTTON
    // =========================
    saveAsBtn.addEventListener('click', async () => {

        try {

            const result =
                await window.electronAPI.saveAs(textarea.value);

            if (result && result.success) {

                currentFilePath = result.filePath;
                lastSavedText = textarea.value;

                statusEl.textContent =
                    `Saved to: ${result.filePath}`;

                statusEl.style.color = 'green';

            } else {

                statusEl.textContent = 'Save As cancelled.';
                statusEl.style.color = 'orange';
            }

        } catch (err) {

            console.error('Save As failed:', err);

            statusEl.textContent = 'Save As failed!';
            statusEl.style.color = 'red';
        }
    });

    // =========================
    // NEW NOTE
    // =========================
    newNoteBtn.addEventListener('click', async () => {

        if (textarea.value === lastSavedText) {

            textarea.value = '';
            currentFilePath = null;

            statusEl.textContent = 'New note started.';
            return;
        }

        const confirmed = await window.electronAPI.newNote();

        if (confirmed) {

            textarea.value = '';
            lastSavedText = '';
            currentFilePath = null;

            statusEl.textContent = 'New note started.';

        } else {

            statusEl.textContent = 'New note cancelled.';
        }
    });

    // =========================
    // OPEN FILE
    // =========================
    openBtn.addEventListener('click', async () => {

        try {

            const result = await window.electronAPI.openFile();

            if (result && result.success) {

                textarea.value = result.content;

                lastSavedText = result.content;

                currentFilePath = result.filePath;

                statusEl.textContent =
                    `Opened: ${result.filePath}`;

                statusEl.style.color = 'green';
            }

        } catch (err) {

            console.error('Open file failed:', err);

            statusEl.textContent = 'Open failed!';
            statusEl.style.color = 'red';
        }
    });

    // =========================
    // DELETE NOTES
    // =========================
    deleteBtn.addEventListener('click', async () => {

        const confirmed = confirm(
            'Really delete ALL notes? This cannot be undone!'
        );

        if (!confirmed) return;

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
            statusEl.style.color = 'red';
        }
    });

});
// NEW: Menu action listeners

window.electronAPI.onMenuAction('menu-new-note', () => {
  // reuse the existing button logic
  newNoteBtn.click();
});

window.electronAPI.onMenuAction('menu-open-file', () => {
  // reuse the existing button logic
  openFileBtn.click();
});

window.electronAPI.onMenuAction('menu-save', () => {
  // reuse the existing button logic
  saveBtn.click();
});

window.electronAPI.onMenuAction('menu-save-as', () => {
  // reuse the existing button logic
  saveAsBtn.click();
});