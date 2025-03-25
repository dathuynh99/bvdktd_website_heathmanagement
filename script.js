function openSidebar() {
    document.getElementById("mySidebar").style.transform = "translateX(250px)";
    document.getElementById("overlay").classList.add("active");
}
function closeSidebar() {
    document.getElementById("mySidebar").style.transform = "translateX(-250px)";
    document.getElementById("overlay").classList.remove("active");
}
