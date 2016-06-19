$(function() {

    $('#side-menu').metisMenu();

});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        topOffset = 50;
        width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url || url.href.indexOf(this.href) == 0;
    }).addClass('active').parent().parent().addClass('in').parent();
    if (element.is('li')) {
        element.addClass('active');
    }
    
});


//Paneles Draggables
$(function () {
    require(["jqueryui"], function () {
        $(".draggablePanel").each(function () {
           
            $(this).hasClass("panel") ? $(this).draggable({
                handle: ".panel-heading"
            }) : $(this).draggable({
                handle: ".modal-header"
            });
            //Para el cierre
            $(this).find(".panel-heading").prepend('<span name="closePanel" class="pull-right closeButtonPanel" data-effect="hide"><i class="fa fa-times"></i></span>');
            $(this).find("[name='closePanel']").click(function () {
                $(this).parents(".draggablePanel").hide();
            })
        });
    });
});


function closeleftnavbar() {
    $("#page-wrapper").css("-webkit-transition", "margin-left 0.5s linear");
    $("#side-menu").css("-webkit-transition", "display 2s linear");
    if ($("#side-menu").css("display") == "block") {       
        $("#page-wrapper").css("margin-left", "0px");
        //$("#side-menu").css("display", "none");
        $("#side-menu").hide("slow")
        $("#imgclosenavbar").removeClass("fa-angle-double-left")
        $("#imgclosenavbar").addClass("fa-angle-double-right");
    }
    else {
        $("#page-wrapper").css("margin-left", "250px");
        //$("#side-menu").css("display", "block");
        $("#side-menu").show("slow")
        $("#imgclosenavbar").removeClass("fa-angle-double-right")
        $("#imgclosenavbar").addClass("fa-angle-double-left");
    }
    
}
