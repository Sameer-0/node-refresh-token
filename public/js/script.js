$(document).ready(function () {
    // SIDE-BAR OPENING EVENT
    const mobileHamburger = document.querySelector('.hamburger-smalldevices');
    const leftBar = document.querySelector('.left-sidebar');

    mobileHamburger.addEventListener('click', () => {
        leftBar.classList.toggle('left-sidebar-open');
    })
})


function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}
