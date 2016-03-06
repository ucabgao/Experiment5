apos.define('apostrophe-rich-text-widgets', {
  construct: function(self, options) {

    // does not use a modal, start and stop editing
    // contextually via ckeditor instead

    self.startEditing = function($widget) {
      if ($widget.data('editor')) {
        $widget.data('editor').start();
        return;
      }
      var options = apos.areas.getWidgetOptions($widget);
      options.$widget = $widget;
      var instance = apos.create('apostrophe-rich-text-editor', options);
      $widget.data('editor', instance);
    };

    self.stopEditing = function($widget) {
      var instance = $widget.data('editor');
      instance.stop();
    };

    // If we're logged in, rich text has a "player"
    // to implement the "click to start editing" behavior

    self.play = function($widget, data, options) {

      $widget.on('click', '[data-rich-text]', function(event) {

        // Don't mess with links in the rich text,
        // even editors need to be able to follow links
        // sometimes. They can use the pencil if the
        // entire text is a link

        var editor = $widget.data('editor');

        var $link = $(event.target).closest('a');
        if ($link.length) {
          if (!editor) {
            // There is no editor yet, allow the link
            // to work normally
            return true;
          } else if (editor.focus) {
            // There is already a focused ckeditor instance,
            // so let it handle the click
            return true;
          } else {
            // There is an unfocused ckeditor instance,
            // aggressively force the link to work instead
            // of the ckeditor click-to-edit behavior
            window.location.href = $link.attr('href');
            return false;
          }
        }

        // Not a link

        if (editor) {
          // Let ckeditor take the focus on its own
          return true;
        }

        // We weren't editing yet, so start
        self.startEditing($widget);
      });
    };

    // Area editor calls this to determine whether to apply an empty state
    // class for the widget
    self.isEmpty = function($widget) {
      var html = $widget.find('[data-rich-text]').html();
      return html === "" || html === ' ' || html === '<div>&nbsp;</div>' || html === '<p><br></p>';
    };
  }
});
