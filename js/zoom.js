$('img[data-enlargeable]').addClass('img-enlargeable').click(function() {
    var src = $(this).attr('src');
    var modal;
    console.log("allo1");

    function removeModal() {
        console.log("allo2");
        modal.remove();
        $('body').off('keyup.modal-close');
    }
    modal = $('<div>').css({
        background: 'RGBA(255,255,255,0.0) url(' + src + ') no-repeat center',
        backgroundSize: 'contain',
        width: '100%',
        height: '50vh',
        position: 'fixed',
        zIndex: '10000',
        top: '25%',
        left: '0',
        cursor: 'zoom-out'
    }).click(function() {
        console.log("allo");
        removeModal();
    }).appendTo('.contents');
    //handling ESC
    $('body').on('keyup.modal-close', function(e) {
    if (e.key === 'Escape') {
        removeModal();
    }
    });
});