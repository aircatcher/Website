;(function ($, window, document, undefined) {
  var pluginName = 'bootstrapDropdownHover',
      defaults = {
        clickBehavior: 'sticky',  // Click behavior setting:
                                  // 'default' means that the dropdown toggles on hover and on click too
                                  // 'disable' disables dropdown toggling with clicking when mouse is detected
                                  //  'sticky' means if we click on an opened dropdown then it will not hide on
                                  //           mouseleave but on a second click only
        
        // Set timeout for the dropdown to hide when the cursor is away from the dropdown (in Miliseconds)
        hideTimeout: 0
      },
      _hideTimeoutHandler,
      _hardOpened = false,
      _touchstartDetected = false,
      _mouseDetected = false;

  // The actual plugin constructor
  function BootstrapDropdownHover(element, options) {
    this.element = $(element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  function bindEvents(dropdown) {
    $('body').one('touchstart.dropdownhover', function() {
      _touchstartDetected = true;
    });

    $('body').one('mouseenter.dropdownhover', function() {
      // touchstart fires before mouseenter on touch devices
      if (!_touchstartDetected) {
        _mouseDetected = true;
      }
    });

    $('.dropdown-toggle, .dropdown-menu', dropdown.element.parent()).on('mouseenter.dropdownhover', function () {
      // seems to be a touch device
      if(_mouseDetected && !$(this).is(':hover')) {
        _mouseDetected = false;
      }

      if (!_mouseDetected) {
        return;
      }

      clearTimeout(_hideTimeoutHandler);
      if (!dropdown.element.parent().hasClass('open')) {
        _hardOpened = false;
        dropdown.element.dropdown('toggle');
      }
    });
    //Hide dropdown when mouse pointer leaves the dropdown menu
    $('.dropdown-toggle, .dropdown-menu', dropdown.element.parent()).on('mouseleave.dropdownhover', function () {
      if (!_mouseDetected) {
        return;
      }

      if (_hardOpened) {
        return;
      }
      _hideTimeoutHandler = setTimeout(function () {
        if (dropdown.element.parent().hasClass('open')) {
          /* dropdown.element.dropdown('toggle'); */
        }
      }, dropdown.settings.hideTimeout);
    });

    dropdown.element.on('click.dropdownhover', function (e) {
      if (!_mouseDetected) {
        return;
      }

      switch(dropdown.settings.clickBehavior) {
        case 'default':
          return;
        case 'disable':
          e.preventDefault();
          e.stopImmediatePropagation();
          break;
        case 'sticky':
          if (_hardOpened) {
            _hardOpened = false;
          }
          else {
            _hardOpened = true;
            if (dropdown.element.parent().hasClass('open')) {
              e.stopImmediatePropagation();
              e.preventDefault();
            }
          }
          return;
      }
    });
  }

  function removeEvents(dropdown) {
    $('.dropdown-toggle, .dropdown-menu', dropdown.element.parent()).off('.dropdownhover');
    // seems that bootstrap binds the click handler twice after we reinitializing the plugin after a destroy...
    $('.dropdown-toggle, .dropdown-menu', dropdown.element.parent()).off('.dropdown');
    dropdown.element.off('.dropdownhover');
    $('body').off('.dropdownhover');
  }

  BootstrapDropdownHover.prototype = {
    init: function () {
      this.setClickBehavior(this.settings.clickBehavior);
      this.setHideTimeout(this.settings.hideTimeout);
      bindEvents(this);
      return this.element;
    },
    setClickBehavior: function(value) {
      this.settings.clickBehavior = value;
      return this.element;
    },
    setHideTimeout: function(value) {
      this.settings.hideTimeout = value;
      return this.element;
    },
    destroy: function() {
      clearTimeout(_hideTimeoutHandler);
      removeEvents(this);
      this.element.data('plugin_' + pluginName, null);
      return this.element;
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    var args = arguments;

    // Is the first parameter an object (options), or was omitted, instantiate a new instance of the plugin.
    if (options === undefined || typeof options === 'object') {
      // This allows the plugin to be called with $.fn.bootstrapDropdownHover();
      if (!$.contains(document, $(this)[0])) {
        $('[data-toggle="dropdown"]').each(function (index, item) {
          // For each nested select, instantiate the plugin
          $(item).bootstrapDropdownHover(options);
        });
      }
      return this.each(function () {
        // If this is not a select
        if (!$(this).hasClass('dropdown-toggle') || $(this).data('toggle') !== 'dropdown') {
          $('[data-toggle="dropdown"]', this).each(function (index, item) {
            // For each nested select, instantiate the plugin
            $(item).bootstrapDropdownHover(options);
          });
        } else if (!$.data(this, 'plugin_' + pluginName)) {
          // Only allow the plugin to be instantiated once so we check that the element has no plugin instantiation yet

          // if it has no instance, create a new one, pass options to our plugin constructor,
          // and store the plugin instance in the elements jQuery data object.
          $.data(this, 'plugin_' + pluginName, new BootstrapDropdownHover(this, options));
        }
      });

      // If the first parameter is a string and it doesn't start with an underscore or "contains" the `init`-function,
      // treat this as a call to a public method.
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

      // Cache the method call to make it possible to return a value
      var returns;

      this.each(function () {
        var instance = $.data(this, 'plugin_' + pluginName);
        // Tests that there's already a plugin-instance and checks that the requested public method exists
        if (instance instanceof BootstrapDropdownHover && typeof instance[options] === 'function') {
          // Call the method of our plugin instance, and pass it the supplied arguments.
          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }
      });

      // If the earlier cached method gives a value back return the value,
      // otherwise return this to preserve chainability.
      return returns !== undefined ? returns : this;
    }

  };

})(jQuery, window, document);

//Multi dropdown menus
$(function(){
	$(".dropdown-menu > li > a.trigger").on('mouseenter.dropdownhover', function (){
		var current=$(this).next();
		var grandparent=$(this).parent().parent();
		if($(this).hasClass('left-caret')||$(this).hasClass('right-caret'))
			//$(this).toggleClass('right-caret left-caret'); //Flips caret
		grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
		grandparent.find(".sub-menu:visible").not(current).hide();
		current.toggle();
		e.stopPropagation();
	});
	$(".dropdown-menu > li > a:not(.trigger)").on("click",function(){
		var root=$(this).closest('.dropdown');
		root.find('.left-caret').toggleClass('right-caret left-caret');
		root.find('.sub-menu:visible').hide();
	});
});

//Shrinking navbar animation
$(window).scroll(function() {
  if ($(document).scrollTop() > 600) {
      $('.navbarScroll').hide(250);
      $('nav').addClass('shrink');
  } else {
      $('.navbarScroll').show(250);
      $('nav').removeClass('shrink');
  }
});
//Shrinking navbar animation
$(window).scroll(function() {
  if ($(document).scrollTop() > 1500) {
      $('.footerScroll').show(250);
      $('nav').addClass('shrink');
  } else {
      $('.footerScroll').hide(250);
      $('nav').removeClass('grow');
  }
});