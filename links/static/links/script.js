
const API_URL = "/api/bookmarks/";

// Get elements from HTML
const form = document.getElementById("bookmark-form");
const titleInput = document.getElementById("title");
const urlInput = document.getElementById("url");


// ----------------------------------------
// Load bookmarks when page opens
// ----------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    loadBookmarks();
});


// ----------------------------------------
// READ - Get all bookmarks
// ----------------------------------------

async function loadBookmarks() {

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load bookmarks");
        }

        const bookmarks = await response.json();

        displayBookmarks(bookmarks);

    } catch (error) {
        console.error(error);
    }
}


// ----------------------------------------
// Display bookmarks on the page
// ----------------------------------------

function displayBookmarks(bookmarks) {

    const bookmarkList = document.querySelector(".bookmark-list");

    // Remove old bookmark cards
    bookmarkList.innerHTML = `
        <div class="section-header">
            <h2>My Bookmarks</h2>
        </div>
    `;

    if (bookmarks.length === 0) {

        bookmarkList.innerHTML += `
            <p class="empty-message">
                No bookmarks yet. Add your first bookmark!
            </p>
        `;

        return;
    }

    bookmarks.forEach(bookmark => {

        const card = document.createElement("div");

        card.className = "bookmark-card";

        card.innerHTML = `
            <div class="bookmark-info">

                <h3>${escapeHtml(bookmark.title)}</h3>

                <a
                    href="${escapeHtml(bookmark.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHtml(bookmark.url)}
                </a>

                <p class="created-date">
                    Added: ${formatDate(bookmark.created_at)}
                </p>

            </div>

            <div class="bookmark-actions">

                <button
                    class="btn btn-edit"
                    onclick="editBookmark(${bookmark.id}, '${escapeJs(bookmark.title)}', '${escapeJs(bookmark.url)}')"
                >
                    Edit
                </button>

                <button
                    class="btn btn-delete"
                    onclick="deleteBookmark(${bookmark.id})"
                >
                    Delete
                </button>

            </div>
        `;

        bookmarkList.appendChild(card);
    });
}


// ----------------------------------------
// CREATE - Add a bookmark
// ----------------------------------------

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();

    if (!title || !url) {
        alert("Please enter both title and URL.");
        return;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },

            body: JSON.stringify({
                title: title,
                url: url
            })
        });

        if (!response.ok) {
            const errorData = await response.json();

            console.error(errorData);

            alert("Could not create bookmark.");

            return;
        }

        // Clear form
        form.reset();

        // Reload bookmarks
        loadBookmarks();

    } catch (error) {

        console.error(error);

        alert("Something went wrong.");
    }
});


// ----------------------------------------
// UPDATE - Edit bookmark
// ----------------------------------------

async function editBookmark(id, oldTitle, oldUrl) {

    const newTitle = prompt("Enter new title:", oldTitle);

    if (newTitle === null) {
        return;
    }

    const newUrl = prompt("Enter new URL:", oldUrl);

    if (newUrl === null) {
        return;
    }

    if (!newTitle.trim() || !newUrl.trim()) {
        alert("Title and URL cannot be empty.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}${id}/`, {

            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },

            body: JSON.stringify({
                title: newTitle.trim(),
                url: newUrl.trim()
            })
        });

        if (!response.ok) {

            const errorData = await response.json();

            console.error(errorData);

            alert("Could not update bookmark.");

            return;
        }

        loadBookmarks();

    } catch (error) {

        console.error(error);

        alert("Something went wrong.");
    }
}


// ----------------------------------------
// DELETE - Delete bookmark
// ----------------------------------------

async function deleteBookmark(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this bookmark?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}${id}/`, {

            method: "DELETE",

            headers: {
                "X-CSRFToken": getCSRFToken(),
            }
        });

        if (!response.ok) {

            alert("Could not delete bookmark.");

            return;
        }

        loadBookmarks();

    } catch (error) {

        console.error(error);

        alert("Something went wrong.");
    }
}


// ----------------------------------------
// CSRF Token
// ----------------------------------------

function getCSRFToken() {

    const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));

    if (!cookieValue) {
        return "";
    }

    return cookieValue.split("=")[1];
}


// ----------------------------------------
// Format date
// ----------------------------------------

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleString();
}


// ----------------------------------------
// Basic HTML escaping
// ----------------------------------------

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// Escape values used inside onclick
function escapeJs(value) {

    return value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}
