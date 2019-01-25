var sectionHeight = function() {
    var total = $(window).height(),
    $section = $('section').css('height', 'auto');
    
    if ($section.outerHeight(true) < total) {
        var margin = $section.outerHeight(true) - $section.height();
        $section.height(total - margin - 20);
    } else {
        $section.css('height', 'auto');
    }
};

$(window).resize(sectionHeight);

$(function() {
    function addTOC(section) {
        var text = section.text;
        var link = '#' + section.hash;
        var extraClass = '';
        if (section.external) {
            link = section.external;
            extraClass = 'external';
        }
        
        $('nav ul').append('<li class="tag-' + section.nodeName + ' ' + extraClass+'"><a href="' + link + '">' + text + '</a></li>');
        $(this).attr('id', section.hash);
    }
    
    var sections = [];
    $('section h1, section h2, section h3').each(function() {
        var nodeName = this.nodeName.toLowerCase();
        var text = $(this).text();
        var hash = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        var external = $(this).find('a').attr('href');
        
        var section = {
            nodeName: nodeName,
            hash: hash,
            text: text,
            external: external,
        };
        
        sections.push(section);
        addTOC(section);
    });
    
    $('nav ul li:first-child a').parent().addClass('active');
    
    $('nav ul li').on('click', 'a', function(event) {
        var position = $($(this).attr('href')).offset().top - 150;
        $('html, body').animate({scrollTop: position}, 400);
        event.preventDefault();
        //$("nav ul li a").parent().removeClass("active");
        //$(this).parent().addClass("active");
    });
    
    sectionHeight();
    
    $('img').on('load', sectionHeight);
});
