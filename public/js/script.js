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
        var context = this;
        var    args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

// TOGGLE FULL-SCREEN

function toggle_full_screen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            /* Firefox */
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            /* Chrome, Safari & Opera */
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (document.msRequestFullscreen) {
            /* IE/Edge */
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            /* Chrome, Safari and Opera */
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            /* IE/Edge */
            document.msExitFullscreen();
        }
    }
}


//CUSTOM DATALIST 

let isSearchableListShowing = false;

      let dataListInput = document.querySelector('.data-list-input');
      let customDataList = document.querySelector('.custom-datalist');

      document.addEventListener('click', function (e) {
       // console.log('targetttttt::', e.target)

        if (isSearchableListShowing === true && (e.target.getAttribute('data-is-visible') == "false" || !e
            .target.getAttribute('data-is-visible'))) {
          console.log('Executing the first block')
          document.querySelector('.data-list-input[data-is-visible="true"]').setAttribute('data-is-visible',
            false);
          document.querySelector('.custom-datalist[data-is-visible="true"]').style.display = 'none';
          document.querySelector('.custom-datalist[data-is-visible="true"]').setAttribute('data-is-visible',
            false);
          isSearchableListShowing = false;
        }

        if (!isSearchableListShowing && e.target.classList.contains('data-list-input') && e.target.getAttribute(
            'data-is-visible') == "false") {
       
          e.target.parentNode.querySelector('.custom-datalist').style.display = 'block';
          e.target.setAttribute('data-is-visible', true);
          e.target.parentNode.querySelector('.custom-datalist').setAttribute('data-is-visible', true);
          isSearchableListShowing = true;
        }

      })

      $('#addMore').on('click', function () {
        console.log("Rows Added::::")
        let lastTr = $('.container .data-searchable-wrapper:last-child')

        let clonedTr = lastTr.clone();

        $('.container').append(clonedTr)
      })

        document.addEventListener('click', function (e) {

        if (e.target.parentNode.classList.contains('custom-datalist')) {
          e.target.parentNode.parentNode.querySelector('input').value = e.target.innerText.trim();
          e.target.parentNode.parentNode.querySelector('input').setAttribute('data-value',e.target.value.trim());
        }

      })


      document.addEventListener('input', function (e) {

        if (e.target.classList.contains('data-list-input')) {

          console.log('management input clicked')
          let text = e.target.value.toUpperCase();
          let options = e.target.parentNode.querySelectorAll('.custom-datalist option');

          for (let option of options) {
            if (option.innerText.toUpperCase().indexOf(text) > -1) {
              option.style.display = "block";
            } else {
              option.style.display = "none";
            }
          }
        }

      })
