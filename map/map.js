const menu = document.getElementById("div_menu");
const canvas = document.getElementById("main");
const description = document.getElementById("description");
const cxt = canvas.getContext("2d");
const dimensions = [
	document.getElementById("overworld"),
	document.getElementById("nether"),
	document.getElementById("end")
]
var width = 0;
var height = 0;
var ox = parseFloat(localStorage.getItem("ox"));
if(isNaN(ox) || !isFinite(ox)) ox = 0.0;
var oy = parseFloat(localStorage.getItem("oy"));
if(isNaN(oy) || !isFinite(oy)) oy = 0.0;
var sc = parseFloat(localStorage.getItem("sc"));
if(isNaN(sc) || !isFinite(sc)) sc = 1.0;
var dimension = parseInt(localStorage.getItem("dimension"));
if(isNaN(dimension) || !isFinite(dimension)) dimension = 0;
var showTags = !(localStorage.getItem("showTags") == "false");
document.getElementById("show_tags_checkbox").checked = showTags;

var images = [new Map(), new Map(), new Map()];
var tags = [[], [], []];
var titles = [[], [], []];
let chosen = null;
var touches = 0;

const paramsStr = window.location.search;
const params = new URLSearchParams(paramsStr);
window.history.replaceState('', '', window.location.href.substring(0, window.location.href.indexOf('?')));

function updateDescription() {
	if(chosen == null) {
		description.style.display = "none";
		return;
	}
	description.style.display = "";
	cmd = "/tp " + chosen.x + ' ' + chosen.y + ' ' + chosen.z;
	description.innerHTML = "<img src=\"" + chosen.img.src + "\"/><div class=\"title_div\"><p class=\"title\" style=\"font-size: " + chosen.fontSize + "px\">" + chosen.name + "</p><p class=\"position\">" +
	chosen.pos + "</p></div><p class=\"content\">" + chosen.desc + 
	"</p><button id=\"close\" onclick=\"chosen.ac = false; chosen = null; repaint(); updateDescription(); \">x</button><p id=\"coordinate\">坐标：\n<a id=\"copy\" title=\"点击复制：" + cmd +
	"\"  onclick=\"navigator.clipboard.writeText('" + cmd + "');\">[" + chosen.x + ', ' + chosen.y + ', ' + chosen.z + "]</a></p>";
}

function drawTag(tag) {
	if(!showTags) return;
	if((tag.minScale == null || sc >= tag.minScale) && (tag.maxScale == null || sc <= tag.maxScale)) {
		img = tag.img,
		sub = tag.sub,
		x = tag.x,
		z = tag.z,
		ac = tag.ac;
		var tx = Math.round(width / 2 + ox + x * sc);
		var ty = Math.round(height / 2 + oy + z * sc);
		if(ac) {
			cxt.drawImage(img, tx - 20, ty - 20, 40, 40);
			cxt.lineWidth = '2';
			cxt.strokeStyle = 'black';
			cxt.strokeRect(tx - 21, ty - 21, 42, 42);
			cxt.strokeStyle = 'white';
			cxt.strokeRect(tx - 23, ty - 23, 46, 46);
			if(sub) {
				cxt.drawImage(sub, tx + 5, ty + 5, 20, 20);
				cxt.lineWidth = '1';
				cxt.strokeStyle = 'white';
				cxt.strokeRect(tx + 4, ty + 4, 21, 21);
			}
		} else {
			cxt.drawImage(img, tx - 16, ty - 16, 32, 32);
			cxt.lineWidth = '1';
			cxt.strokeStyle = 'black';
			cxt.strokeRect(tx - 17, ty - 17, 33, 33);
			cxt.strokeStyle = 'white';
			cxt.strokeRect(tx - 18, ty - 18, 35, 35);
			if(sub) {
				cxt.drawImage(sub, tx + 4, ty + 4, 16, 16);
				cxt.lineWidth = '1';
				cxt.strokeStyle = 'white';
				cxt.strokeRect(tx + 3, ty + 3, 17, 17);
			}
		}
	}
}

function repaint() {
	cxt.imageSmoothingEnabled = false;
	cxt.clearRect(0, 0, width, height);
	var lx = Math.ceil((-width - ox) / sc / 128) - 1;
	var rx = Math.floor((width - ox) / sc / 128) + 1;
	var ly = Math.ceil((-height - oy) / sc / 128) - 1;
	var ry = Math.floor((height - oy) / sc / 128) + 1;
	for(var cx = lx; cx <= rx; ++cx) for(var cy = ly; cy <= ry; ++cy) {
		var x = cx * 128, z = cy * 128;
		var key = x + ' ' + z;
		if(images[dimension].has(key)) {
			let arr = images[dimension].get(key);
			for(var i = 0; i < arr.length; ++i) {
				let img = arr[i];
				if(!img.image.src) img.image.src = img.src, img.image.onload = function() { repaint(); };
				else {
					var s = img.s;
					cxt.drawImage(img.image, width / 2 + ox + (x - 128 * s / 2) * sc, height / 2 + oy + (z - 128 * s / 2) * sc, 128 * s * sc, 128 * s * sc);
				}
			}
		}
	}
	for(var i = 0; i < tags[dimension].length; ++i) if(!tags[dimension][i].ac) drawTag(tags[dimension][i]);
	for(var i = 0; i < titles[dimension].length; ++i) if((titles[dimension][i].minScale == null || sc >= titles[dimension][i].minScale) && (titles[dimension][i].maxScale == null || sc <= titles[dimension][i].maxScale)) {
		x = titles[dimension][i].x,
		z = titles[dimension][i].z,
		title = titles[dimension][i].title;
		cxt.fillStyle = '#363636',
		cxt.font = titles[dimension][i].fontSize + "px Mojangles",
		cxt.textAlign = "center",
		cxt.textBaseline = "middle";
		cxt.fillText(title, width / 2 + ox + x * sc + titles[dimension][i].fontSize / 16, height / 2 + oy + z * sc + titles[dimension][i].fontSize / 16);
		cxt.fillStyle = '#FFFFFF',
		cxt.font = titles[dimension][i].fontSize + "px Mojangles",
		cxt.textAlign = "center",
		cxt.textBaseline = "middle";
		cxt.fillText(title, width / 2 + ox + x * sc, height / 2 + oy + z * sc);
	}
	for(var i = 0; i < tags[dimension].length; ++i) if(tags[dimension][i].ac) drawTag(tags[dimension][i]);
}

function loadImage(dim, src, x, z, s) {
	var img = new Image();
	var key = x + ' ' + z;
	if(!images[dim].has(key)) images[dim].set(key, []);
	images[dim].get(key).push({
		image: img,
		s: s,
		src: src
	});
	images[dim].get(key).sort(function (a, b) { return b.s - a.s; });
	img.onload = function() { repaint(); }
}

function loadTitle(dim, title, x, z, fontSize, maxScale) {
	titles[dim].push({
		title: title,
		x: x,
		z: z,
		fontSize: fontSize,
		maxScale: maxScale
	});
}

function loadTag(dim, src, sub, x, y, z, name, desc, pos, fontSize, minScale, maxScale) {
	var img = new Image();
	img.src = "../icons/" + src;
	if (sub) {
		var subscript = new Image();
		subscript.src = "../icons/" + sub;
	} else var subscript = null;
	if (!pos) pos = "";
	if (!fontSize) fontSize = 32;
	img.onload = () => {
		var tag = {
			img: img,
			sub: subscript,
			x: x,
			y: y,
			z: z,
			name: name,
			desc: desc,
			pos: pos,
			fontSize: fontSize,
			ac: false,
			minScale: minScale,
			maxScale: maxScale
		};
		if(tag.name == decodeURI(params.get("focus"))) {
			let pos = params.get("pos");
			let td = params.get("dim");
			if ((!pos || decodeURI(pos) == tag.pos) && (!td || td == "" + dim)) {
				ox = -tag.x;
				oy = -tag.z;
				sc = 1.0;
				if (tag.minScale != null) sc = Math.max(sc, tag.minScale);
				if (tag.maxScale != null) sc = Math.min(sc, tag.maxScale);
				setDimension(dim);
				if (chosen != null) chosen.ac = false;
				chosen = tag;
				tag.ac = true;
				updateDescription();
			}
		}
		tags[dim].push(tag);
		repaint();
	}
}

var leftClick = false;
var lx = null;
var ly = null;
var ldis = null;

function leftclick(cx, cy) {
	lx = cx;
	ly = cy;
	var fl = true;
	if(showTags) {
		for(var i = 0; i < tags[dimension].length; ++i) if((tags[dimension][i].minScale == null || sc >= tags[dimension][i].minScale) && (tags[dimension][i].maxScale == null || sc <= tags[dimension][i].maxScale)) {
			x = tags[dimension][i].x,
			z = tags[dimension][i].z;
			var tx = Math.round(width / 2 + ox + x * sc);
			var ty = Math.round(height / 2 + oy + z * sc);
			if(tx - 16 <= lx && lx < tx + 16 && ty - 16 <= ly && ly < ty + 16) {
				if(chosen != null) chosen.ac = false;
				chosen = tags[dimension][i];
				chosen.ac = true;
				fl = false;
			}
		}
	}
	if(fl) {
		if(chosen != null) chosen.ac = false;
		chosen = null;
	}
	updateDescription();
	repaint();
}

function scale(x, cx, cy) {
	var rsc = sc;
	sc = x;
	const U = Math.pow(0.998, -1000);
	const D = Math.pow(0.998, 1000);
	if(sc > U) sc = U;
	if(sc < D) sc = D;
	p = sc / rsc;
	var px = cx - width / 2;
	var py = cy - height / 2;
	ox = px + (ox - px) * p;
	oy = py + (oy - py) * p;
	repaint();
}

canvas.addEventListener("mousedown", function(event) {
	if(event.button == 0) {
		leftClick = true;
		leftclick(event.offsetX, event.offsetY);
	}
}, false);

canvas.addEventListener("touchstart", function(event) {
	touches = event.touches.length;
	var rc = canvas.getBoundingClientRect();
	if(touches == 1) {
		var x = event.touches[0].clientX - rc.x;
		var y = event.touches[0].clientY - rc.y;
		lx = x, ly = y;
		leftclick(lx, ly);
	}else if(touches == 2) {
		var x1 = event.touches[0].clientX - rc.x;
		var y1 = event.touches[0].clientY - rc.y;
		var x2 = event.touches[1].clientX - rc.x;
		var y2 = event.touches[1].clientY - rc.y;
		ldis = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
		lx = (x1 + x2) / 2.0,
		ly = (y1 + y2) / 2.0;
	}
}, false);

canvas.addEventListener("mouseup", function(event) {
	if(event.button == 0) {
		leftClick = false;
		lx = null;
		ly = null;
	}
}, false);

canvas.addEventListener("touchend", function(event) {
	ldis = null, lx = null, ly = null;
	return false;
}, false);

canvas.addEventListener("mouseout", function(event) {
	leftClick = false;
	lx = null;
	ly = null;
}, false);

canvas.addEventListener("touchcancel", function(event) {
	touches = 0;
	lx = null;
	ly = null;
	ldis = null;
}, false);

canvas.addEventListener("mousemove", function(event) {
	if(leftClick && lx != null && ly != null) {
		ox += event.offsetX - lx;
		oy += event.offsetY - ly;
		lx = event.offsetX;
		ly = event.offsetY;
		repaint();
	}
}, false);

canvas.addEventListener("touchmove", function(event) {
	touches = event.touches.length;
	var rc = canvas.getBoundingClientRect();
	if(touches == 1) {
		var x = event.touches[0].clientX - rc.x;
		var y = event.touches[0].clientY - rc.y;
		if(lx != null && ly != null) ox += x - lx, oy += y - ly;
		lx = x, ly = y;
		repaint();
	}else if(touches == 2) {
		var x1 = event.touches[0].clientX - rc.x;
		var y1 = event.touches[0].clientY - rc.y;
		var x2 = event.touches[1].clientX - rc.x;
		var y2 = event.touches[1].clientY - rc.y;
		var dis = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
		if(ldis != null) scale(sc / ldis * dis, lx, ly);
		ldis = dis;
	}
	return false;
}, false);

canvas.onmousewheel = function() {
	var event = event || window.event;
	scale(sc * Math.pow(0.998, event.deltaY), event.offsetX, event.offsetY);
	return false;
}

function setDimension(x) {
	if(x == dimension) return;
	if(chosen) chosen.ac = false;
	chosen = null;
	dimensions[dimension].style.border = "none";
	dimension = x;
	dimensions[dimension].style.border = "2px solid white";
	repaint();
	updateDescription();
}
dimensions[dimension].style.border = "2px solid white";

function resizeEvent() {
	canvas.style.top = menu.clientHeight + "px";
	width = canvas.width = canvas.clientWidth;
	height = canvas.height = canvas.clientHeight;
	description.style.top = (10 + menu.clientHeight) + "px";
	document.getElementById("reset").style.top = (16 + menu.clientHeight) + "px";
	document.getElementById("show_tags").style.top = (16 + menu.clientHeight) + "px";
	repaint();
}

window.onresize = resizeEvent;
resizeEvent();

window.onunload = function () {
	localStorage.setItem("ox", ox),
	localStorage.setItem("oy", oy),
	localStorage.setItem("sc", sc),
	localStorage.setItem("dimension", dimension);
	localStorage.setItem("showTags", showTags);
}

function loadJSON(url, func) {
	const Http = new XMLHttpRequest();
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200)
			func(JSON.parse(Http.responseText));
	}
}

loadJSON("./terrain.json", function(res) {
	for(var i = 0; i < res.length; ++i) {
		[dim, s, x, y] = res[i].match(/[-\d]+/g);
		dim = parseInt(dim),
		s = parseInt(s),
		x = parseInt(x),
		y = parseInt(y);
		loadImage(dim, "./terrain/" + res[i], x, y, 1 << s);
	}
})

loadJSON("./tags.json", function(res) {
	for(var i = 0; i < res.length; ++i) {
		var tag = res[i];
		loadTag(tag["dimension"], tag["image"], tag["subscript"], tag["x"], tag["y"], tag["z"], tag["name"], tag["description"], tag["position"], tag["fontSize"], tag["minScale"], tag["maxScale"]);
	}
})


loadTitle(0, "竹岛", 640, -158, 24, null);
loadTitle(0, "开服地", 800, 72, 24, null);
loadTitle(0, "伐木林", 840, -240, 24, null);
loadTitle(0, "中程岛", -640, 150, 24, null);
loadTitle(0, "与海", -240, 0, 24, null);
loadTitle(0, "间海", 240, 1120, 24, null);
loadTitle(0, "东伯利亚", 1800, -1300, 24, null);
loadTitle(1, "下界工业区", 100, 0, 24, null);
loadTitle(2, "末地工业区", 320, 0, 24, null);