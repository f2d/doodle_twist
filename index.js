
//* Utility functions *--------------------------------------------------------

function gc(n,p) {try {return TOS.slice.call((p || document).getElementsByClassName(n) || []);} catch(e) {return [];}}
function gt(n,p) {try {return TOS.slice.call((p || document).getElementsByTagName(n) || []);} catch(e) {return [];}}
function gn(n,p) {try {return TOS.slice.call((p || document).getElementsByName(n) || []);} catch(e) {return [];}}
function gi(n,p) {try {return TOS.slice.call((p || document).getElementsById(n) || []);} catch(e) {return [];}}
function id(i) {return document.getElementById(i);}

//* Page-specific functions *--------------------------------------------------

function clearData(event) {
	if (!canvas) return;

	drawEnd(event);
	counter.textContent = data = 0, strokes = [], spreadStrokes = [];
	count = {points: 0, lines: 0};
	clearFill(ctx);
}

function clearFill(ctx) {
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);
	return ctx;
}

function getOffsetPoint(e) {
var	x = 0, y = 0;
	while (e) x += e.offsetLeft, y += e.offsetTop, e = e.offsetParent;
	return {x:x, y:y};
}

function getCurrentPoint(event, plus) {
var	o = getOffsetPoint(canvas), p = ((ctx.lineWidth % 2) ? DRAW_PIXEL_OFFSET : 0) - CANVAS_BORDER;
	point.x = event.pageX - o.x + p + (plus || 0);
	point.y = event.pageY - o.y + p;
	return {x: point.x, y: point.y};
}

function drawStart(event) {
	if (stroke || event.target != canvas) return;

	stroke = [getCurrentPoint(event)];

	ctx.beginPath();
	ctx.moveTo(point.x, point.y);

	count.points ++;
}

function drawMove(event, plus) {
	if (!stroke) return;

	stroke.push(getCurrentPoint(event, plus));

	if (data) ctx.putImageData(data, 0,0);
	else clearFill(ctx);

	ctx.lineTo(point.x, point.y);
	ctx.stroke();

	count.points ++, updateCounter();
}

function drawEnd(event) {
	if (!stroke) return;

	if (stroke.length < 2) drawMove(event, 0.01);
	strokes.push(stroke);

	data = ctx.getImageData(0,0, canvas.width, canvas.height);

	count.lines ++, updateCounter(), stroke = 0;
}

function updateCounter() {
	counter.textContent = count.points + la.points + count.lines + la.lines;
}

function twist(add) {
	if (!canvas || !data || stroke) return;

var	i = 'img'
,	e = id(i)
	;

	if (!e) {
		document.body.appendChild(e = document.createElement(i));
		e.id = i;
		e.title = la.save;
	}

	clearFill(ctx).beginPath();

	for (i in strokes) {
		if (!spreadStrokes[i]) spreadStrokes[i] = [];
	var	a = strokes[i];
		for (j in a) {
		var	j,k, original = a[j], prev, point = {x:0, y:0}, prevs, shift = {x:0, y:0};
			for (k in point) {
				shift[k] = (Math.random()*RANDOM_RADIUS*2 - RANDOM_RADIUS)*(add || 1) + (j > 0 ? prevs[k] : 0);
				point[k] = (
					add
				&&	spreadStrokes[i][j]
				?	spreadStrokes[i][j]
				:	original
				)[k] + shift[k];
			}
			if (j == 0) ctx.moveTo(point.x, point.y); else
			if (j > 1) ctx.quadraticCurveTo(
				prev.x
			,	prev.y
			,	(prev.x + point.x)/2
			,	(prev.y + point.y)/2
			);
			spreadStrokes[i][j] = prev = point, prevs = shift;
		}
		ctx.lineTo(point.x, point.y);
	}
	ctx.stroke();
	e.src = canvas.toDataURL();
	ctx.putImageData(data, 0,0);
}

function init() {
	canvas = id('canvas');
	ctx = canvas.getContext('2d');

	clearData();

	for (i in (a = {
		lineWidth: 1
	,	lineCap: 'round'
	,	lineJoin: 'round'
	,	strokeStyle: 'black'
	})) ctx[i] = a[i];

	for (i in (a = {
		mousedown:	drawStart
	,	mousemove:	drawMove
	,	mouseup:	drawEnd
	})) document.addEventListener(i, a[i], false);
}

//* Runtime *------------------------------------------------------------------

var	point = {}
,	DRAW_PIXEL_OFFSET = 0.5
,	CANVAS_BORDER = 1
,	RANDOM_RADIUS = 5
,	canvas, ctx, data, count, stroke, strokes, spreadStrokes
,	a,i
;

document.addEventListener('DOMContentLoaded', init, false);
