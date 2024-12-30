
$('img[data-enlargeable]').addClass('img-enlargeable').click(function() {
    var src = $(this).attr('src');
    var modal;
    var bgSize = '';
    let factor = parseFloat($(this).data('enlargeable')) || 1.0;
    function removeModal() {
        modal.remove();
        $('.contents').off('keyup.modal-close');
    }
    let newWidth;
    newWidth = Math.min(window.innerWidth, window.innerHeight)/factor;
    bgSize = newWidth.toString() + 'px ' + ' auto' ;

    modal = $('<div>').css({
        background: 'RGBA(0,0,0,0.5) url(' + src + ') no-repeat center',
        "background-size":bgSize,
        width: '100%',
        height: '100%',
        position: 'fixed',
        zIndex: '10000',
        top: '0',
        left: '0',
        cursor: 'zoom-out',
        "object-fit": 'cover'
    }
    ).click(function() {
        removeModal();
    }).appendTo('.contents');
});