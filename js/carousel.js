$(document).ready(function(){
  // Activate all Carousels
  $(".carousel").each(function(){
      $(this).carousel();
  });

  // Enable Carousel Indicators for all carousels
  $(".item1").click(function(){
    $(this).closest('.carousel').carousel(0);
  });
  $(".item2").click(function(){
    $(this).closest('.carousel').carousel(1);
  });
  $(".item3").click(function(){
    $(this).closest('.carousel').carousel(2);
  });
  $(".item4").click(function(){
    $(this).closest('.carousel').carousel(3);
  });
  $(".item5").click(function(){
    $(this).closest('.carousel').carousel(4);
  });
  $(".item6").click(function(){
    $(this).closest('.carousel').carousel(5);
  });

  $(".item7").click(function(){
    $(this).closest('.carousel').carousel(6);
  });

  $(".item8").click(function(){
    $(this).closest('.carousel').carousel(7);
  });

  $(".item9").click(function(){
    $(this).closest('.carousel').carousel(8);
  });

  // Enable Carousel Controls for all carousels
  $(".left").click(function(){
    $(this).closest('.carousel').carousel("prev");
  });
  $(".right").click(function(){
    $(this).closest('.carousel').carousel("next");
  });
});
