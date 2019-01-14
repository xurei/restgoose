var sectionHeight = function() {
    var total    = $(window).height(),
    $section = $('section').css('height','auto');
    
    if ($section.outerHeight(true) < total) {
        var margin = $section.outerHeight(true) - $section.height();
        $section.height(total - margin - 20);
    } else {
        $section.css('height','auto');
    }
};

$(window).resize(sectionHeight);

$(function() {
    
    var sections = [];
    
    function addTOC(section) {
        var text = section.text;
        $('nav ul').append('<li class="tag-'+section.nodeName+'"><a href="#'+section.hash+'">' + text + '</a></li>');
        $(this).attr('id', section.hash);
    }
    
    $("section h1, section h2, section h3").each(function(){
        var nodeName = this.nodeName.toLowerCase();
        var text = $(this).text();
        var hash = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g,'');
        console.log(nodeName, hash, text);
    
        var section = {
            nodeName: nodeName,
            hash: hash,
            text: text,
        };
        
        sections.push(section);
        addTOC(section);
    });
    
    var nesting = [];
    sections.forEach((section) => {
        var level = parseInt(section.nodeName.substr(1));
        nesting[level] = section;
        console.log(level);
    
    });
    
    console.log(sections);
    $('nav ul li:first-child a').parent().addClass('active');
    
    $("nav ul li").on("click", "a", function(event) {
        var position = $($(this).attr("href")).offset().top - 190;
        $("html, body").animate({scrollTop: position}, 400);
        $("nav ul li a").parent().removeClass("active");
        $(this).parent().addClass("active");
        event.preventDefault();
    });
    
    sectionHeight();
    
    $('img').on('load', sectionHeight);
});