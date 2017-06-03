/**
 * Created by Derek Xiao on 6/3/2017.
 */

function visualize_scanning(sorted_vertex) {
    var x_values = sorted_vertex.map(function (v) {
        return v.x;
    });
    //var canvas = document.getElementById('animation');
    //var animation_ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    var progress = 0, step = 0.003, highlight_radius = 30;

    var max_progress = (highlight_radius) / width + 1;

    var node_color = "#3c3c3c";
    var scaling_radius = function (delta) {
        delta = Math.max(0, delta - 15);
        return highlight_radius * Math.exp(-delta / 10);
    };
    function frame() {
        var x_threshold = progress * width;
        var vertex = sorted_vertex.filter(function (v) {
            return v.x <= x_threshold + highlight_radius * 2;
        });

        animation_ctx.clearRect(0, 0, width, height);

        if (progress < 1) {
            animation_ctx.beginPath();
            animation_ctx.fillStyle = "rgba(128,128,128,0.2)";
            animation_ctx.fillRect(-1, -1, x_threshold + 1, height + 2);
        }

        animation_ctx.fillStyle = node_color;
        animation_ctx.fillRect(x_threshold - 1, -1, 4, height + 2);

        var size = 20;
        for (var i = 0; i < vertex.length; i ++) {
            var v = vertex[i];
            var delta = Math.abs(v.x - x_threshold);
            if (delta < highlight_radius * 5) {
                var r = scaling_radius(delta);
                animation_ctx.beginPath();
                animation_ctx.fillStyle = "orange";
                animation_ctx.fillRect(v.x - r, v.y - r,
                    r * 2, r * 2
                );
            }
            animation_ctx.fillStyle = node_color;
            animation_ctx.fillRect(v.x - size / 2, v.y - size / 2, size, size);

            // draw right neighbour relationship
            var rn = v.get_right_neighbour();
            if (rn == null) {
                continue;
            }
            animation_ctx.setLineDash([]);
            animation_ctx.lineWidth = 5;
            animation_ctx.beginPath();
            animation_ctx.moveTo(v.x, v.y);
            var e = interpolate(v, rn, Math.min(1, delta / highlight_radius * 0.05));
            animation_ctx.lineTo(e.x, e.y);
            animation_ctx.stroke();
        }
        if (progress <= max_progress) {
            requestAnimationFrame(frame);
        }
        progress += step;
    }

    var animation_id = requestAnimationFrame(frame);
    console.log(animation_id);
}

function display_quadrilateral(quadrilaterals, history) {
    var context = animation_ctx;
    clearCanvas(context);
    if (quadrilaterals.length == 0) return;
    var progress = 0, step = 1 / quadrilaterals.length * 0.01;
    var first_stage = 0.1,
        second_stage = 0.5,
        third_stage = 0.1,
        last_stage = 0.3;
    var active_lineWidth = 10;
    var progress_per_q = 1 / quadrilaterals.length;
    function frame() {
        clearCanvas(context);
        var completed_count = Math.floor(progress * quadrilaterals.length);
        quadrilaterals.slice(0, completed_count).forEach(function (q) {
            q.drawPath_closed(context, "rgb(208,208,208)");
        });

        var animation_quadrilateral_id = completed_count;
        if (animation_quadrilateral_id >= quadrilaterals.length) {
            return;
        }
        var q = quadrilaterals[animation_quadrilateral_id];
        var residual = progress - completed_count * progress_per_q;
        var t = residual / progress_per_q;
        var u = history[animation_quadrilateral_id][0];
        var v = history[animation_quadrilateral_id][1];
        var r = history[animation_quadrilateral_id][2];
        var s = history[animation_quadrilateral_id][3];

        var mid_t;
        mid_t = interpolate(u, v, Math.min(t / first_stage, 1));
        context.save();
        context.lineWidth = active_lineWidth;
        context.strokeStyle = "black";
        context.beginPath();
        context.moveTo(u.x, u.y);
        context.lineTo(mid_t.x, mid_t.y);
        context.stroke();
        context.restore();

        if (t > first_stage) {
            mid_t = interpolate(v, r, Math.min((t - first_stage) / second_stage, 1));
            context.save();
            context.setLineDash([10, 6]);
            context.lineWidth = active_lineWidth;
            context.strokeStyle = "gray";
            context.beginPath();
            context.moveTo(v.x, v.y);
            context.lineTo(mid_t.x, mid_t.y);
            context.stroke();
            context.restore();
        }
        if (t > first_stage + second_stage) {
            mid_t = interpolate(r, s, Math.min((t - first_stage - second_stage) / third_stage, 1));
            context.save();
            context.lineWidth = active_lineWidth;
            context.strokeStyle = "black";
            context.beginPath();
            context.moveTo(r.x, r.y);
            context.lineTo(mid_t.x, mid_t.y);
            context.stroke();
            context.restore();
        }
        if (t > first_stage + second_stage + third_stage) {
            var opacity = (t - first_stage - second_stage - third_stage) / last_stage;
            opacity = 1 / (1 + Math.exp((opacity * 12 - 6)));
            var color = "rgba(128,128,128," + opacity + ")";
            q.drawPath_closed(animation_ctx, color, active_lineWidth);
        }

        progress += step;
        if (progress <= 1 + first_stage) {
            requestAnimationFrame(frame);
        }
    }

    var animation_id = requestAnimationFrame(frame);
}