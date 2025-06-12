# TABCloset Chrome Extension

TABCloset is a sleek and modern Chrome extension designed to help you save, organize, annotate, and relaunch groups of URLs. It's perfect for knowledge workers, students, and power users who need to manage multiple sets of tabs for different workflows, with a visually appealing and highly functional interface.

## Features

- 🗂 **Enhanced Group Management**: Create and manage groups of related links with a two-column card layout for improved organization.
- 🔗 **Smart Link Saving**: Easily save the current tab to any group, with automatic title and URL capture.
- ✨ **Intuitive UI**: Enjoy a streamlined and modern design with rounded corners for the extension popup and dynamic sizing.
- 🚀 **Quick Access**: Open all links in a group with a single click, or double-click individual links to open them.
- 😄 **Emoji Customization**: Personalize your groups with a dedicated emoji keyboard for easy selection.
- 🌗 **Night Mode**: Toggle between light and dark themes for a comfortable browsing experience, with theme preference persistence.
- 🔄 **Drag-and-Drop Reordering**: Easily reorder your groups by dragging and dropping them into your preferred arrangement.
- 💾 **Local Storage**: All your groups and links are safely stored locally in your browser.

## Installation

1.  Clone or download this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle in the top right corner.
4.  Click the "Load unpacked" button and select the root directory of the cloned extension.

## Usage

1.  Click the TABCloset icon in your Chrome toolbar to open the extension popup.
2.  **Create a New Group**: Click the "+" button in the header. Enter a group name and choose an emoji using the pop-up emoji keyboard.
3.  **Add Links**: Open a group by clicking on its card. The current tab will appear as a potential addition. Click "Save Here" to add it.
4.  **Manage Links**: Within a group's link list:
    *   Double-click a link to open it in a new tab.
    *   Click the '↗️' icon to open a specific link.
    *   Click the '📝' icon to add or edit notes for a link.
    *   Click the '🗑️' icon to delete a link.
    *   Click "Open All" to launch all links in the group.
5.  **Reorder Groups**: Drag and drop group cards to change their order in the main view.
6.  **Toggle Dark Mode**: Click the moon/sun icon in the header to switch between light and dark themes.

## Development

The extension is built using:

*   HTML/CSS/JavaScript
*   Chrome Extensions API
*   Chrome Storage API
*   `emoji-picker-element` library for emoji selection

## License

MIT License 