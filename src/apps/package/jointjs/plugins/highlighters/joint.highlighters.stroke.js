joint.highlighters.stroke = {

    defaultOptions: {
        padding: 3,
        rx: 0,
        ry: 0,
        attrs: {
            'stroke-width': 3,
            stroke: '#FEB663'
        }
    },

    _views: {},

    getHighlighterId: function(magnetEl, opt) {

        return magnetEl.id + JSON.stringify(opt);
    },

    removeHighlighter: function(id) {
        if (this._views[id]) {
            this._views[id].remove();
            this._views[id] = null;
        }
    },

    /**
     * @param {joint.dia.CellView} cellView
     * @param {Element} magnetEl
     * @param {object=} opt
     */
    highlight: function(cellView, magnetEl, opt) {

        var id = this.getHighlighterId(magnetEl, opt);

        // Only highlight once.
        if (this._views[id]) return;

        var options = _.defaults(opt || {}, this.defaultOptions);

        var magnetVel = V(magnetEl);
        var magnetBBox;

        try {

            var pathData = magnetVel.convertToPathData();

        } catch (error) {

            // Failed to get path data from magnet element.
            // Draw a rectangle around the entire cell view instead.
            magnetBBox = magnetVel.bbox(true/* without transforms */);
            pathData = V.rectToPath(_.extend({}, options, magnetBBox));
        }

        var highlightVel = V('path').attr({
            d: pathData,
            'pointer-events': 'none',
            'vector-effect': 'non-scaling-stroke',
            'fill': 'none'
        }).attr(options.attrs);

        highlightVel.transform(cellView.el.getCTM().inverse());
        highlightVel.transform(magnetEl.getCTM());

        var padding = options.padding;
        if (padding) {

            magnetBBox || (magnetBBox = magnetVel.bbox(true));
            // Add padding to the highlight element.
            var cx = magnetBBox.x + (magnetBBox.width / 2);
            var cy = magnetBBox.y + (magnetBBox.height / 2);
            var sx = (magnetBBox.width + padding) / magnetBBox.width;
            var sy = (magnetBBox.height + padding) / magnetBBox.height;
            highlightVel.transform({
                a: sx,
                b: 0,
                c: 0,
                d: sy,
                e: cx - sx * cx,
                f: cy - sy * cy
            });
        }

        // joint.mvc.View will handle the theme class name and joint class name prefix.
        var highlightView = this._views[id] = new joint.mvc.View({
            svgElement: true,
            className: 'highlight-stroke',
            el: highlightVel.node
        });

        // Remove the highlight view when the cell is removed from the graph.
        var removeHandler = _.bind(this.removeHighlighter, this, id);
        var cell = cellView.model;
        highlightView.listenTo(cell, 'remove', removeHandler);
        highlightView.listenTo(cell.graph, 'reset', removeHandler);

        cellView.vel.append(highlightVel);
    },

    /**
     * @param {joint.dia.CellView} cellView
     * @param {Element} magnetEl
     * @param {object=} opt
     */
    unhighlight: function(cellView, magnetEl, opt) {

        this.removeHighlighter(this.getHighlighterId(magnetEl, opt));
    }
};
