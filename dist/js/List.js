"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var List = function () {
  function List(window, config) {
    _classCallCheck(this, List);

    this.config = config;
    this.window = window;
    this.zoom = this.config.zoom_list;
    this.pixels_x = this.config.sprite_x;
    this.pixels_y = this.config.sprite_y;
    this.width = this.pixels_x * this.zoom;
    this.height = this.pixels_y * this.zoom;
    this.clicked_sprite = 0;
    this.sorted_array = [];
    this.grid = true;

    var template = "\n      <div class=\"window_menu\">\n        <img src=\"img/icon3/icon-list-new.png\" id=\"icon-list-new\" title=\"new sprite\">\n        <img src=\"img/icon3/icon-list-delete.png\" id=\"icon-list-delete\" title=\"remove sprite\">\n        <img src=\"img/icon3/icon-list-copy.png\" id=\"icon-list-copy\" title=\"copy sprite\">\n        <img src=\"img/icon3/icon-list-paste.png\" id=\"icon-list-paste\" title=\"paste sprite\">\n        \n        <div class=\"right\">\n          <img src=\"img/icon3/icon-grid.png\" id=\"icon-list-grid\" title=\"toggle grid borders\">\n          <img src=\"img/icon3/icon-zoom-in.png\" id=\"icon-list-zoom-in\" title=\"zoom in\"><img src=\"img/icon3/icon-zoom-out.png\" id=\"icon-list-zoom-out\" title=\"zoom out\">\n        </div>\n      </div>\n      <div id=\"spritelist\"></div>\n    ";

    $("#window-" + this.window).append(template);

    $("#spritelist").sortable({
      cursor: "move",
      tolerance: "pointer",
      revert: 'invalid'
    });

    // this line is ridiculous, but apparently it is needed for the sprite sorting to not screw up
    $("<style type='text/css'> .list-sprite-size{ width:" + this.width + "px; height:" + this.height + "px;} </style>").appendTo("head");

    $("#spritelist").disableSelection();
  }

  _createClass(List, [{
    key: "create_canvas",
    value: function create_canvas(id, current_sprite) {
      var _this = this;

      var canvas_element = document.createElement('canvas');
      canvas_element.id = id;
      canvas_element.width = this.width;
      canvas_element.height = this.height;

      /*
      var sprite_div = `<div id="sprite-${id}" class="sprite"></div>`;
      $("#spritelist").append(sprite_div);
      $("#sprite-"+id).append(canvas_element);
      */

      $("#spritelist").append(canvas_element);
      $(canvas_element).addClass("sprite_in_list");
      $(canvas_element).addClass("list-sprite-size"); // see comment in constructor

      if (current_sprite == id) $(canvas_element).addClass("sprite_in_list_selected");
      if (this.grid) $(canvas_element).addClass("sprite_in_list_border");

      $(canvas_element).mouseup(function (e) {
        _this.clicked_sprite = id;
      });

      $(canvas_element).mouseenter(function (e) {
        return $(canvas_element).addClass("sprite_in_list_hover");
      });
      $(canvas_element).mouseleave(function (e) {
        return $(canvas_element).removeClass("sprite_in_list_hover");
      });
    }
  }, {
    key: "get_clicked_sprite",
    value: function get_clicked_sprite() {
      return this.clicked_sprite;
    }
  }, {
    key: "toggle_grid",
    value: function toggle_grid() {
      if (this.grid) {
        this.grid = false;
      } else {
        this.grid = true;
      }
    }
  }, {
    key: "zoom_in",
    value: function zoom_in() {
      if (this.zoom <= 16) {
        this.zoom++;
        this.update_zoom();
      }
    }
  }, {
    key: "zoom_out",
    value: function zoom_out() {
      if (this.zoom >= 2) {
        this.zoom--;
        this.update_zoom();
      }
    }
  }, {
    key: "is_min_zoom",
    value: function is_min_zoom() {
      if (this.zoom < 2) return true;
    }
  }, {
    key: "is_max_zoom",
    value: function is_max_zoom() {
      if (this.zoom > 16) return true;
    }
  }, {
    key: "update_zoom",
    value: function update_zoom() {
      this.width = this.pixels_x * this.zoom;
      this.height = this.pixels_y * this.zoom;
      $('head style:last').remove();
      $("<style type='text/css'> .list-sprite-size{ width:" + this.width + "px; height:" + this.height + "px;} </style>").appendTo("head");
    }
  }, {
    key: "update_current_sprite",
    value: function update_current_sprite(all_data) {

      // this one gets called during drawing in the editor
      // because the normal update method gets too slow
      // when the sprite list is becoming longer
      var sprite_data = all_data.sprites[all_data.current_sprite];
      var canvas = document.getElementById(all_data.current_sprite).getContext('2d');

      var x_grid_step = 1;
      if (sprite_data.multicolor) x_grid_step = 2;

      // first fill the whole sprite with the background color
      canvas.fillStyle = this.config.colors[all_data.colors["t"]];
      canvas.fillRect(0, 0, this.width, this.height);

      for (var i = 0; i < this.pixels_x; i = i + x_grid_step) {
        for (var j = 0; j < this.pixels_y; j++) {

          var array_entry = sprite_data.pixels[j][i];

          if (array_entry != "t") {
            var color = sprite_data.color;
            if (array_entry != "i" && sprite_data.multicolor) color = all_data.colors[array_entry];
            canvas.fillStyle = this.config.colors[color];
            canvas.fillRect(i * this.zoom, j * this.zoom, x_grid_step * this.zoom, this.zoom);
          }
        }
      }
    }
  }, {
    key: "update",
    value: function update(all_data) {
      $('#window-' + this.window).dialog('option', 'title', 'sprite ' + (all_data.current_sprite + 1) + " of " + all_data.sprites.length);
      $(".sprite_in_list").remove();

      var length = all_data.sprites.length;
      for (var i = 0; i < length; i++) {
        this.create_canvas(i, all_data.current_sprite);

        var canvas = document.getElementById(i).getContext('2d');
        var sprite_data = all_data.sprites[i];
        var x_grid_step = 1;
        if (sprite_data.multicolor) x_grid_step = 2;

        // first fill the whole sprite with the background color
        canvas.fillStyle = this.config.colors[all_data.colors["t"]];
        canvas.fillRect(0, 0, this.width, this.height);

        for (var _i = 0; _i < this.pixels_x; _i = _i + x_grid_step) {
          for (var j = 0; j < this.pixels_y; j++) {

            var array_entry = sprite_data.pixels[j][_i];

            if (array_entry != "t") {
              var color = sprite_data.color;
              if (array_entry != "i" && sprite_data.multicolor) color = all_data.colors[array_entry];
              canvas.fillStyle = this.config.colors[color];
              canvas.fillRect(_i * this.zoom, j * this.zoom, x_grid_step * this.zoom, this.zoom);
            }
          }
        }
      }
    }
  }]);

  return List;
}();