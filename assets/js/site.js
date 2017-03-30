var isMobile = null;
$(function() {
    isMobile = $(window).width() <= 600;
    $(window).on('resize', function(e) {
        isMobile = $(window).width() <= 600;
    });
});

// Show and hide the nav menu when the hamburger icon is clicked.
$(function() {
    $(".hamburger").click(function() {
        var $this = $(this);
        $this.toggleClass("is-active");
        $(".nav-menu").toggle();

        // Set overflow on body and html as appropriate.
        var isActive = $this.hasClass("is-active");
        var bodyHeight = isActive ? "100%" : "auto";
        var bodyOverflow = isActive ? "hidden" : "auto";
        var bodyPosition = isActive ? "fixed" : "relative";
        $("body").css({
            "height": bodyHeight,
            "overflow": bodyOverflow,
            "position": bodyPosition
        });
        $("html").css({
            "overflow": bodyOverflow
        });


        positionFooter();
    });

    var options = $(".options"),
      footer = $("div.nav-menu .site-footer");
    footer.addClass("noAlign");

    var positionFooter = function() {
        var optionsTop = options.offset().top,
          optionsHeight = options.outerHeight(true),
          // margin-top gets double-counted, so we need to subtract it.
          optionsMarginTop = parseInt(options.css("marginTop"));

        var footerHeight = footer.outerHeight(true);
        // If we weren't pinning the footer to the bottom of the screen, where
        // would it be?
        var expectedFooterTop = optionsTop + optionsHeight - optionsMarginTop;

        if ($(window).height() >= expectedFooterTop + footerHeight) {
            // Pin to bottom of screen with position: absolute
            if (footer.hasClass("noAlign")) {
                footer.addClass("alignBottom");
                footer.removeClass("noAlign");
            }
        } else {
            // render in normal flow
            if (footer.hasClass("alignBottom")) {
                footer.addClass("noAlign");
                footer.removeClass("alignBottom");
            }
        }
    }

    $(window).resize(positionFooter);
});

// 1. Update hash on scroll 2. Show share buttons when scrolling upwards
// Scroll headers are notorious for perf issues, but hopefully this is okay...
$(function() {
    // Only do these on content pages (with <article />).
    var article = $("article");
    if (article.length > 0) {
        var currentHash = window.location.hash;
        var changeUrlHash = function(e) {
            var hashToSet = "";
            $("h2, h3").each(function() {
                var top = window.pageYOffset;
                // h3s have # of employee tags that we should include
                var topOffset = $(this).prop("tagName").toLowerCase() === "h3" ? 30 : 0;
                if (window.pageYOffset >= $(this).offset().top - topOffset) {
                    hashToSet = $(this).attr("id");
                }
            });
            if (hashToSet != currentHash) {
                // I think there's no way to completely delete the hash, only
                // set it to #
                history.replaceState(null, null, "#" + hashToSet);
                currentHash = hashToSet;
            }
        }

        var $shareButtons = $("#share-buttons");
        var lastKnownScrollPosition = window.pageYOffset; // this might always be 0, even for hash urls
        var shareButtonDisplay = function(e) {
          var scrollDelta = window.pageYOffset - lastKnownScrollPosition;
          lastKnownScrollPosition = window.pageYOffset;

          // not yet sure if I want this: only shows share buttons when we're
          // looking at the content itself
          // var insideShareable = window.pageYOffset > article.offset().top &&
          //  window.pageYOffset < article.height() + article.offset().top + 50;
          var insideShareable = true

          var isVisible = $shareButtons.hasClass("visible");
          if (scrollDelta < 0 && !isVisible && insideShareable) { // scrolled up
              $shareButtons.addClass("visible");
          } else if (!insideShareable || (scrollDelta > 0 && isVisible)) {
              $shareButtons.removeClass("visible");
          }
        }

        var $twitterShare = $("#twitterShare");
        var $fbShare = $("#fbShare");
        var shareButtonClickHandler = function(width, height, shareAnchor) {
            var windowOptions = "scrollbars=yes,resizable=yes,toolbar=no,location=yes",
              winHeight = screen.height,
              winWidth = screen.width;

            return function(e) {
                var left = Math.round((winWidth / 2) - (width / 2));
                var top = 0;

                if (winHeight > height) {
                    top = Math.round((winHeight / 2) - (height / 2));
                }

                window.open(
                  shareAnchor.attr("href"),
                  "intent",
                  windowOptions + ",width=" + width + ",height=" + height + ",left=" + left + ",top=" + top);

                e.returnValue = false;
                e.preventDefault();
            }
        }
        $twitterShare.click(shareButtonClickHandler(550, 420, $twitterShare));
        $fbShare.click(shareButtonClickHandler(555, 602, $fbShare));

        $(document).on("scroll", function(e) {
          changeUrlHash(e);
          if (!isMobile) {
            shareButtonDisplay(e);
          }
        });

        $(document).on("scrollstop", function(e) {
          if (isMobile) {
            shareButtonDisplay(e);
          }
        });
    }
});

$(function() {
    if ($(".footnote").length > 0) {
        var $tooltip = $('<div id="inline-footnote"><div class="inline-nub"></div><div id="inline-content"></div></div>');
        $tooltip.on("mouseup", function(event) {
            // Clicks inside the tooltip shouldn't trigger document.mouseUp.
            event.stopPropagation();
            return true;
        });
        $("body").append($tooltip);

        var currentFootnote = null;

        function collapseTooltips() {
            $tooltip.css("display", "none");
            currentFootnote = null;
        }

        var $tooltipContent = $("#inline-content");
        $(".footnote").each(function() {
            var $this = $(this);

            $this.click(function(event) {
                // Disable on mobile.
                if ($(window).width() <= 600) {
                  return true;
                }

                // Clicking on a footnote twice should do the normal behavior
                // of jumping to the footnotes list at the end.
                if ($this == currentFootnote) {
                    collapseTooltips();
                    return true;
                }

                collapseTooltips();
                $tooltip.css({
                    display: "block",
                    left: $this.offset().left + ($this.width() / 2) - 20,
                    top: $this.offset().top + $this.outerHeight() + 10,
                });
                var escapedId = $this.attr("href").replace(":", "\\:");
                $tooltipContent.empty();
                $tooltipContent.append($(escapedId).clone().children());
                currentFootnote = $this;
                return false; // preventDefault + stopPropogation
            });
        });

        $(document).on("mouseup", function(event) {
            // We don't want to do anything when someone's clicking a footnote.
            // Let the footnote code above take care of it.
            var clickedFootnote = $(event.target).parents("sup");
            if (clickedFootnote.length === 0) {
                collapseTooltips();
            }
        });
    }
});
