$('img[data-enlargeable]').addClass('img-enlargeable').click(function() {
    var src = $(this).attr('src');
    var modal;
    var bgSize = '';
    console.log(this.width);

    function removeModal() {
        console.log("allo2");
        modal.remove();
        $('.contents').off('keyup.modal-close');
    }
    if (window.matchMedia("(max-width:700px").matches) {
        bgSize = 'contain';
    } else {
        let new_width = this.width*3;
        let new_height = this.height*3;
        bgSize = new_width.toString() + 'px ' + new_height.toString() + 'px ' ;
    }

    modal = $('<div>').css({
        background: 'RGBA(0,0,0,0.5) url(' + src + ') no-repeat center',
        backgroundSize: bgSize,
        width: '100%',
        height: '100vh',
        position: 'fixed',
        zIndex: '10000',
        top: '0',
        left: '0',
        cursor: 'zoom-out'
    }).click(function() {
        removeModal();
    }).appendTo('.contents');
});