document.getElementById('cancel-button').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent the default behavior of a link

    // Use the history object to go back to the previous page or tab
    window.history.back();
});