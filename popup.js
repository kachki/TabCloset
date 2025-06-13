// Default placeholder groups
const PLACEHOLDER_GROUPS = [
    { name: 'Work', emoji: '💼', links: [] },
    { name: 'School', emoji: '🎓', links: [] },
    { name: 'Wishlist', emoji: '🛒', links: [] }
];

// State management
let groups = [];
let currentGroupIndex = -1; // To keep track of the group being viewed
let draggedGroupIndex = -1; // To store the index of the group being dragged
let currentTabInfo = null; // To store current tab details

// DOM Elements
const groupsList = document.getElementById('groupsList');
const newGroupBtn = document.getElementById('newGroupBtn');
const newGroupModal = document.getElementById('newGroupModal');
const addLinkModal = document.getElementById('addLinkModal');
const groupNameInput = document.getElementById('groupName');
const groupEmojiInput = document.getElementById('groupEmoji');
const emojiPickerContainer = document.getElementById('emojiPickerContainer');
const linkTitleInput = document.getElementById('linkTitle');
const linkUrlInput = document.getElementById('linkUrl');
const linkNotesInput = document.getElementById('linkNotes');
const currentTabLink = document.getElementById('currentTabLink');
const saveCurrentTabBtn = document.getElementById('saveCurrentTabBtn');

const linksListModal = document.getElementById('linksListModal');
const groupTitleInModal = document.getElementById('groupTitleInModal');
const linksListContainer = document.getElementById('linksListContainer');
const openAllLinksBtn = document.getElementById('openAllLinksBtn');
const deleteGroupBtn = document.getElementById('deleteGroupBtn');
const closeLinksModalBtn = document.getElementById('closeLinksModalBtn');
const darkModeToggle = document.getElementById('darkModeToggle');

const editNoteModal = document.getElementById('editNoteModal');
const noteModalTitle = document.getElementById('noteModalTitle');
const noteContent = document.getElementById('noteContent');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');

// Initialize the extension
document.addEventListener('DOMContentLoaded', async () => {
    await loadGroups();
    await loadThemePreference(); // Load theme preference
    renderGroups();
    setupEventListeners();
    // Pre-fetch current tab info
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        currentTabInfo = tabs[0];
    });
    initializeEmojiPicker(); // Initialize the emoji picker
});

// Load theme preference from storage
async function loadThemePreference() {
    const result = await chrome.storage.local.get('darkMode');
    if (result.darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<img src="icons/sun_icon.png" alt="Sun Icon" class="icon-img">'; // Sun icon for dark mode
    } else {
        darkModeToggle.innerHTML = '<img src="icons/moon_icon.png" alt="Moon Icon" class="icon-img">'; // Moon icon for light mode
    }
}

// Toggle dark mode
async function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    await chrome.storage.local.set({ darkMode: isDarkMode });
    darkModeToggle.innerHTML = isDarkMode ? '<img src="icons/sun_icon.png" alt="Sun Icon" class="icon-img">': '<img src="icons/moon_icon.png" alt="Moon Icon" class="icon-img">';
}

// Load groups from storage, or use placeholders if empty
async function loadGroups() {
    const result = await chrome.storage.local.get('groups');
    if (!result.groups || result.groups.length === 0) {
        groups = [...PLACEHOLDER_GROUPS];
        await saveGroups();
    } else {
        groups = result.groups;
    }
}

// Save groups to storage
async function saveGroups() {
    await chrome.storage.local.set({ groups });
}

// Render groups based on currentLayout
function renderGroups() {
    groupsList.innerHTML = '';
    groupsList.classList.remove('circles-layout-active');

    groups.forEach((group, groupIndex) => {
        let groupElement = createGroupCard(group, groupIndex);
        groupsList.appendChild(groupElement);
    });
}

// Create a group card element (current UI)
function createGroupCard(group, groupIndex) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-card';
    groupDiv.setAttribute('draggable', 'true'); // Make draggable
    groupDiv.dataset.index = groupIndex; // Store original index

    // Drag event listeners for this group card
    groupDiv.addEventListener('dragstart', handleDragStart);

    // Single click: show links list modal, with current tab as potential addition
    groupDiv.onclick = (e) => {
        e.stopPropagation();
        showLinksListModal(groupIndex);
    };

    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'group-emoji';
    emojiDiv.textContent = group.emoji || '📁';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'group-info';
    const titleDiv = document.createElement('div');
    titleDiv.className = 'group-title';
    titleDiv.textContent = group.name;
    infoDiv.appendChild(titleDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'group-actions';

    groupDiv.appendChild(emojiDiv);
    groupDiv.appendChild(infoDiv);
    groupDiv.appendChild(actionsDiv);

    // Dark Mode Toggle
    darkModeToggle.onclick = toggleDarkMode;

    return groupDiv;
}

// Create a link card element
function createLinkCard(link, groupIndex, linkIndex) {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'link-card';

    const favicon = document.createElement('img');
    favicon.className = 'link-favicon';
    favicon.src = `chrome://favicon/${link.url}`;
    favicon.onerror = () => favicon.src = 'icons/default-favicon.png';

    const info = document.createElement('div');
    info.className = 'link-info';

    const title = document.createElement('div');
    title.className = 'link-title';
    title.textContent = link.title;

    const url = document.createElement('div');
    url.className = 'link-url';
    url.textContent = link.url;

    info.appendChild(title);
    info.appendChild(url);

    // Actions container for buttons
    const actions = document.createElement('div');
    actions.className = 'link-actions-container';

    // Open Link Button
    const openLinkBtn = document.createElement('button');
    openLinkBtn.className = 'btn-icon';
    openLinkBtn.innerHTML = '↗️';
    openLinkBtn.title = 'Open Link';
    openLinkBtn.onclick = (e) => {
        e.stopPropagation();
        chrome.tabs.create({ url: link.url });
    };
    actions.appendChild(openLinkBtn);

    // Note Link Button
    const noteLinkBtn = document.createElement('button');
    noteLinkBtn.className = 'btn-icon';
    noteLinkBtn.innerHTML = '📝';
    noteLinkBtn.title = 'Add/Edit Note';
    noteLinkBtn.onclick = (e) => {
        e.stopPropagation();
        showEditNoteModal(groupIndex, linkIndex);
    };
    actions.appendChild(noteLinkBtn);

    // Delete Link Button
    const deleteLinkBtn = document.createElement('button');
    deleteLinkBtn.className = 'btn-icon delete-icon';
    deleteLinkBtn.innerHTML = 'x';
    deleteLinkBtn.title = 'Delete Link';
    deleteLinkBtn.onclick = async (e) => {
        e.stopPropagation(); // Prevent card click from firing
        if (confirm('Are you sure you want to delete this link?')) {
            groups[groupIndex].links.splice(linkIndex, 1);
            await saveGroups();
            showLinksListModal(groupIndex); // Re-render the links list
        }
    };
    actions.appendChild(deleteLinkBtn);

    // Note display div (still exists for notes, but now toggled by button)
    const noteDisplayDiv = document.createElement('div');
    noteDisplayDiv.className = 'link-notes-display';
    if (link.notes) {
        noteDisplayDiv.textContent = link.notes;
        noteDisplayDiv.style.display = 'block'; // Show if notes exist
    } else {
        noteDisplayDiv.textContent = 'No note'; // Placeholder
        noteDisplayDiv.style.display = 'none'; // Hide if no notes
    }

    linkDiv.appendChild(favicon);
    linkDiv.appendChild(info);
    linkDiv.appendChild(actions); // Add the actions container
    linkDiv.appendChild(noteDisplayDiv); // Add the note display div

    // Double-click to open link
    linkDiv.ondblclick = (e) => {
        e.stopPropagation();
        chrome.tabs.create({ url: link.url });
    };
    // Remove single click to open link
    linkDiv.onclick = null;

    return linkDiv;
}

// Show new group modal
function showNewGroupModal() {
    newGroupModal.style.display = 'block';
    groupNameInput.value = '';
    groupEmojiInput.value = '';
    groupNameInput.focus();
}

// Show add link modal (only shows current tab info)
function showAddLinkModal(groupIndex) {
    addLinkModal.style.display = 'block';
    addLinkModal.dataset.groupIndex = groupIndex;
    currentGroupIndex = groupIndex;

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tab = tabs[0];
        currentTabLink.textContent = tab.title + ' (' + tab.url + ')';
        currentTabLink.href = tab.url;
        linkTitleInput.value = tab.title;
        linkUrlInput.value = tab.url;
    });
}

// Show links list modal
function showLinksListModal(groupIndex) {
    linksListModal.style.display = 'block';
    currentGroupIndex = groupIndex; // Set current group index
    const group = groups[groupIndex];

    groupTitleInModal.textContent = group.name; // Set modal title
    linksListContainer.innerHTML = ''; // Clear previous links

    // Add current tab as a potential addition
    if (currentTabInfo && currentTabInfo.url !== 'chrome://newtab/' && currentTabInfo.url !== 'about:blank') {
        const currentTabCard = document.createElement('div');
        currentTabCard.className = 'link-card potential-addition';

        const favicon = document.createElement('img');
        favicon.className = 'link-favicon';
        favicon.src = `chrome://favicon/${currentTabInfo.url}`;
        favicon.onerror = () => favicon.src = 'icons/default-favicon.png';

        const info = document.createElement('div');
        info.className = 'link-info';
        const title = document.createElement('div');
        title.className = 'link-title';
        title.textContent = currentTabInfo.title;
        const url = document.createElement('div');
        url.className = 'link-url';
        url.textContent = currentTabInfo.url;
        info.appendChild(title);
        info.appendChild(url);

        const saveHereBtn = document.createElement('button');
        saveHereBtn.className = 'btn-primary';
        saveHereBtn.textContent = 'Save Here';
        saveHereBtn.onclick = async (e) => {
            e.stopPropagation();
            // Check if link already exists in group to prevent duplicates
            const linkExists = group.links.some(link => link.url === currentTabInfo.url);
            if (!linkExists) {
                await addCurrentTabLink(currentGroupIndex, currentTabInfo.title, currentTabInfo.url, '');
                // Re-render only the links in the modal after saving
                showLinksListModal(currentGroupIndex);
            } else {
                alert('This link is already in this group!');
            }
        };

        currentTabCard.appendChild(favicon);
        currentTabCard.appendChild(info);
        currentTabCard.appendChild(saveHereBtn);

        linksListContainer.appendChild(currentTabCard);
    }

    // Display existing links
    if (group.links && group.links.length > 0) {
        group.links.forEach((link, idx) => {
            linksListContainer.appendChild(createLinkCard(link, groupIndex, idx));
        });
    } else if (!currentTabInfo || currentTabInfo.url === 'chrome://newtab/' || currentTabInfo.url === 'about:blank') {
        linksListContainer.innerHTML += '<p style="text-align: center; color: #888; margin-top: 20px;">No links saved in this group yet. Open a tab to save it.</p>';
    }
}

// Add new group
async function addGroup(name, emoji) {
    groups.push({
        name,
        emoji: emoji || '📁',
        links: []
    });
    await saveGroups();
    renderGroups();
}

// Add current tab as link
async function addCurrentTabLink(groupIndex, title, url, notes) {
    groups[groupIndex].links.push({
        title,
        url,
        notes
    });
    await saveGroups();
    // No need to call renderGroups() here, showLinksListModal will refresh the view
    // renderGroups();
}

// Delete group
async function deleteGroup(groupIndex) {
    if (confirm('Are you sure you want to delete this group?')) {
        groups.splice(groupIndex, 1);
        await saveGroups();
        renderGroups();
        linksListModal.style.display = 'none'; // Close modal after deleting
    }
}

// Open all links in a group
function openAllLinks(links) {
    links.forEach(link => {
        chrome.tabs.create({ url: link.url });
    });
}

// Handle drag start event
function handleDragStart(e) {
    draggedGroupIndex = parseInt(e.target.dataset.index); // Store the index of the dragged item
    e.dataTransfer.effectAllowed = 'move';
    // Using a setTimeout to ensure the element is captured before the opacity changes
    setTimeout(() => {
        e.target.classList.add('dragging');
    }, 0);
}

// Handle drag over event on the container (groupsList)
function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';

    const draggingElement = document.querySelector('.dragging');
    if (!draggingElement) return;

    const container = e.currentTarget; // This is groupsList
    const children = Array.from(container.children).filter(child => child !== draggingElement && child.classList.contains('group-card')); // Filter for actual group elements (only cards now)

    let afterElement = children.find(child => {
        const box = child.getBoundingClientRect();
        return e.clientY < box.top + box.height / 2;
    });

    if (afterElement) {
        container.insertBefore(draggingElement, afterElement);
    } else if (children.length > 0) {
        container.appendChild(draggingElement);
    }
}

// Handle drag end event
async function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    const newOrder = Array.from(groupsList.children)
                            .filter(child => child.dataset.index !== undefined)
                            .map(child => groups[parseInt(child.dataset.index)]);
    groups = newOrder;
    await saveGroups();
    renderGroups(); // Re-render to ensure correct indices and clean up
    draggedGroupIndex = -1; // Reset
}

// Setup event listeners
function setupEventListeners() {
    newGroupBtn.onclick = showNewGroupModal;

    // Add drag and drop event listeners to the groups container
    groupsList.addEventListener('dragover', handleDragOver);
    groupsList.addEventListener('drop', handleDragEnd); // Drop handled by dragend, which reorders
    groupsList.addEventListener('dragleave', (e) => { /* Optional: visual feedback when leaving */ });
    groupsList.addEventListener('dragenter', (e) => { e.preventDefault(); /* Necessary for dragover to fire */ });

    document.getElementById('saveGroupBtn').onclick = async () => {
        const name = groupNameInput.value.trim();
        const emoji = groupEmojiInput.value.trim();
        if (name) {
            await addGroup(name, emoji);
            newGroupModal.style.display = 'none';
        }
    };
    document.getElementById('cancelGroupBtn').onclick = () => {
        newGroupModal.style.display = 'none';
    };

    document.getElementById('saveLinkBtn').onclick = async () => {
        const groupIndex = currentGroupIndex;
        const title = linkTitleInput.value.trim();
        const url = linkUrlInput.value.trim();
        const notes = ''; // Notes input removed, so pass empty string
        if (title && url) {
            await addCurrentTabLink(groupIndex, title, url, notes);
            addLinkModal.style.display = 'none';
            // Automatically show the links list for the group just saved to
            showLinksListModal(currentGroupIndex);
        }
    };

    // Links List Modal buttons - these now only operate from within the links modal
    openAllLinksBtn.onclick = () => {
        if (currentGroupIndex !== -1) {
            openAllLinks(groups[currentGroupIndex].links);
        }
    };
    deleteGroupBtn.onclick = async () => {
        if (currentGroupIndex !== -1) {
            await deleteGroup(currentGroupIndex);
        }
    };
    closeLinksModalBtn.onclick = () => {
        linksListModal.style.display = 'none';
        currentGroupIndex = -1; // Reset
    };

    // Dark Mode Toggle
    darkModeToggle.onclick = toggleDarkMode;

    window.onclick = (event) => {
        if (event.target === newGroupModal) {
            newGroupModal.style.display = 'none';
        }
        if (event.target === addLinkModal) {
            addLinkModal.style.display = 'none';
        }
        if (event.target === linksListModal) {
            linksListModal.style.display = 'none';
            currentGroupIndex = -1; // Reset
        }
    };
}

// Emoji Picker Initialization
function initializeEmojiPicker() {
    const picker = document.createElement('emoji-picker');
    picker.setAttribute('locale', 'en');
    picker.setAttribute('skin-tone-emoji', '🖐️');
    emojiPickerContainer.appendChild(picker);

    groupEmojiInput.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the modal from closing if it's in a modal
        emojiPickerContainer.style.display = 'block';
        // Position the picker relative to the input field or center it
        // For now, it's absolutely positioned at the bottom-left of the modal
    });

    picker.addEventListener('emoji-click', (event) => {
        groupEmojiInput.value = event.detail.unicode;
        emojiPickerContainer.style.display = 'none';
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (event) => {
        if (emojiPickerContainer.style.display === 'block' && !emojiPickerContainer.contains(event.target) && event.target !== groupEmojiInput) {
            emojiPickerContainer.style.display = 'none';
        }
    });

     // Close emoji picker when the modal is closed
     cancelGroupBtn.addEventListener('click', () => {
        emojiPickerContainer.style.display = 'none';
    });

    saveGroupBtn.addEventListener('click', () => {
        emojiPickerContainer.style.display = 'none';
    });
}

// Show edit note modal
function showEditNoteModal(groupIndex, linkIndex) {
    editNoteModal.style.display = 'block';
    editNoteModal.dataset.groupIndex = groupIndex;
    editNoteModal.dataset.linkIndex = linkIndex;

    const link = groups[groupIndex].links[linkIndex];
    noteModalTitle.textContent = `Note for: ${link.title}`;
    noteContent.value = link.notes || '';
    noteContent.focus();
}

// Event Listeners for Edit Note Modal
cancelNoteBtn.addEventListener('click', () => {
    editNoteModal.style.display = 'none';
});

saveNoteBtn.addEventListener('click', async () => {
    const groupIndex = editNoteModal.dataset.groupIndex;
    const linkIndex = editNoteModal.dataset.linkIndex;
    if (groupIndex !== undefined && linkIndex !== undefined) {
        groups[groupIndex].links[linkIndex].notes = noteContent.value;
        await saveGroups();
        showLinksListModal(parseInt(groupIndex)); // Re-render the links list to show updated note
    }
    editNoteModal.style.display = 'none';
}); 