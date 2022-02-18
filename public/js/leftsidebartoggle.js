$('.left-sidebar-toggle').click(function () {
    console.log('leftsidebar pressed')
    let leftbar = $('.left-sidebar');
    leftbar.toggleClass('left-400');

    let main = $('.main')
    main.toggleClass('left-0');

    let nav = $('.top-navbar');
    nav.toggleClass('left-0');

    let btn = $('.left-sidebar-toggle');
    btn.toggleClass('left-sidebar-toggle-turn')
})

var notification = $(".notification-content");


// var btn = document.getElementById("myBtn");


var close = $(".notification-close");


function notify() {

    notification.addClass('notification-active');
    $('.notification-content').css('display', 'flex');

}


$(".notification-close").on('click', function () {
    notification.removeClass('notification-active')
    location.reload();
})




// Get the <button> element that closes the modal
var close = $('.close');

// When the user clicks on the button, open the modal
function alertMsg() {
    $('#alertModal').css('display', 'block')


}


// When the user clicks on <button> (x), close the modal

$('.close').on('click', function () {
    $('#alertModal').css('display', 'none');
})