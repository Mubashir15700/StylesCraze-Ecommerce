
// Function to open the modal
function openModal(imageSrc) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImage");
    modal.style.display = "block";
    modalImg.src = imageSrc;
}

const zoomedImage = document.getElementById('modalImage');
const zoomContainer = document.getElementById('modalImage');

zoomContainer.addEventListener('click', function () {
    zoomedImage.classList.toggle('zoomed');
});

var modal = document.getElementById("closeButton");
modal.onclick = function () {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
};