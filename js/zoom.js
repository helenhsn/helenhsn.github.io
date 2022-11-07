
$('img[data-enlargeable]').addClass('img-enlargeable').click(function() {
    var src = $(this).attr('src');
    var modal;
    var bgSize = '';
    var newMaxWidth = this.width;
    var newMaxHeight = this.height;
    console.log(newMaxWidth);
    console.log(newMaxHeight);
    
    function removeModal() {
        modal.remove();
        $('.contents').off('keyup.modal-close');
    }
    let newWidth;
    let factor = 2;
    if (window.matchMedia("(max-width:700px").matches || this.id=='raycaster') {
        factor = 1.10;
    }
    newWidth = Math.min(window.innerWidth, window.innerHeight)/factor;
    bgSize = newWidth.toString() + 'px ' + ' auto' ;

    modal = $('<div>').css({
        background: 'RGBA(0,0,0,0.5) url(' + src + ') no-repeat center',
        "background-size":bgSize,
        width: '100%',
        height: '100vh',
        position: 'fixed',
        zIndex: '10000',
        top: '0',
        left: '0',
        cursor: 'zoom-out'
    }
    ).click(function() {
        removeModal();
    }).appendTo('.contents');
});