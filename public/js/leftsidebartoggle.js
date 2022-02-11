$('.left-sidebar-toggle').click(function() {
    console.log('leftsidebar pressed')
    let leftbar = $('.left-sidebar');
    leftbar.toggleClass('left-400');

    let main = $('.main')
    main.toggleClass('left-0');

    let nav = $('.top-navbar');
    nav.toggleClass('left-0');
})