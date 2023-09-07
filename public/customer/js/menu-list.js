document.addEventListener("DOMContentLoaded", function () {
    var listIcon = document.getElementById("list-icon");
    var dropdownMenu = document.getElementById("dropdown-menu");

    // Function to toggle the dropdown menu's visibility
    function toggleDropdown() {
        if (dropdownMenu.style.display === "block") {
            dropdownMenu.style.display = "none";
        } else {
            dropdownMenu.style.display = "block";
        }
    }

    // Add a click event listener to the list icon
    listIcon.addEventListener("click", toggleDropdown);

    // Close the dropdown menu when clicking outside of it
    document.addEventListener("click", function (event) {
        if (!listIcon.contains(event.target)) {
            dropdownMenu.style.display = "none";
        }
    });
});