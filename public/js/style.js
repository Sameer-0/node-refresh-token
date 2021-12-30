$(document).ready(function () {
    //DOCUMENT READY STARTS HERE

    /*Active Link*/
    $("#accordion1 ul a li").each(function () {
        console.log($(this).text());

        if ($(this).hasClass("activeNavLink")) {
            $(this).parent().parent().addClass('show');
            $(this).parent().parent().parent().find('.fa-plus').css({
                "transition": "0.5s",
                "transform": "rotateZ(40deg)"
            });
        }
    });

    /*Tooltip*/
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    /*Datatable*/
    if ($(".dataTable").length > 0) {
        $('.dataTable').DataTable();
    }
    /*SIDEBAR VIEW AND HIDE*/
    var displaySidebar = false;
    /*Ckeditor*/
    if ($(".ckeditor").length > 0) {
        ClassicEditor
            .create(document.querySelector('.ckeditor'))
            .catch(error => {
                console.error(error);
            });
    }


    $(".navbar-toggler").click(
        function () {
            if (displaySidebar == false) {
                $(".rightSidebar").css({
                    "right": "0px"
                });
                $('.navbar-toggler').html("<i class=\"far fa-times-circle fa-lg\"></i>").animate({
                    "font-size": "20px"
                });
                displaySidebar = true;

            } else {
                $(".rightSidebar").css({
                    "right": "-400px"
                });
                $('.navbar-toggler').html("<i class=\"fas fa-bars\"></i>")
                displaySidebar = false;
            }
        }
    );

    //Navabr Dropdown Actions

    //On Show
    $('nav.navbar .dropdown').on('show.bs.dropdown', function () {
        var parentWidth = $(this).outerWidth();
        $(this).addClass('bg-red');
        $(this).find('a:first').addClass('text-white');

        $(this).find('.dropdown-menu').css('min-width', parentWidth);
    });
    //On Hide
    $('nav.navbar .dropdown').on('hide.bs.dropdown', function () {
        $(this).removeClass('bg-red');
        $(this).find('a').removeClass('text-white');
    });

    $('#accordion1 .collapse, #accordion2 .collapse').on('show.bs.collapse', function () {
        $(this).parent().find('.fa-plus').css({
            "transition": "0.5s",
            "transform": "rotateZ(40deg)"
        });
    })
    $('#accordion1 .collapse, #accordion2 .collapse').on('hide.bs.collapse', function () {
        $(this).parent().find('.fa-plus').css({
            "transition": "0.5s",
            "transform": "rotateZ(0deg)"
        });
    })




    //Login Body Alignment
    if ($('.login-body').length >= 1) {
        var loginWidth = $('.login-body').outerWidth();
        var halfWidth = loginWidth / 2
        console.log(loginWidth);
        console.log(halfWidth);
        $('.login-body').css({
            'left': 'calc(50% - ' + halfWidth + 'px)'
        });

        $(window).resize(function () {
            loginWidth = $('.login-body').outerWidth();
            halfWidth = loginWidth / 2
            console.log(loginWidth);
            console.log(halfWidth);
            $('.login-body').css({
                'left': 'calc(50% - ' + halfWidth + 'px)'
            });
        });
    }


    //Scroll Top Button
    var scrollPosition = $(window).scrollTop();

    if (scrollPosition > 0) {
        $('.scroll-to-top').removeClass('d-none');
    }

    $(window).scroll(function () {
        scrollPosition = $(window).scrollTop();
        if (scrollPosition > 0) {
            $('.scroll-to-top').removeClass('d-none');
        } else {
            $('.scroll-to-top').addClass('d-none');
        }
    });

    $('.scroll-to-top').click(function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    //DOCUMENT READY ENDS HERE
});
