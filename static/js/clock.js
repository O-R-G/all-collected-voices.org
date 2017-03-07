
var canvas;		// canvas
var context;	// canvas context
var width;		// canvas width
var height;		// canvas height
var r;			// clock radius

var center = new Array(); 	// center coordinates
var hands = new Array();	// hand info
var lineWidths = new Array(); 
var handTimer;

// colour info
var colours = 
{
	bg: 'rgba(255, 255, 255, 0.0)',
	h: '#000',
	m: '#000',
	s: '#000',
	circle: '#000',
	circleopen: '#000'
};

var pos = "centre";

// set size variables
function set_size(width, height)
{
	if(!width)
	{
		if(pos == "lower-right")
		{
			// silly mobile safari bug
			if(window.innerWidth == 980 && screen.width < 768)
				width = screen.width * 0.5;
			else if(window.innerWidth > 768)
				width = window.innerWidth * 0.33;
			else
				width = window.innerWidth * 0.5;
			height = width;
		}
		else
		{
			width = window.innerWidth;
			if (!height)
				height = window.innerHeight * 0.9;
		}
	}
	var min = Math.min(width, height);
	r = min * 0.8;

	// set the hand lengths
	hands = 
	{
		h: r * 0.5,
		m: r * 0.9,
		s: r * 0.95
	};

	devAdjust = 1.0;
 
	// set the line widths
	lineWidths = 
	{
		h: min * 0.015 * devAdjust,
		m: min * 0.015 * devAdjust,
		s: min * 0.007 * devAdjust,
		circle: min * 0.015 * devAdjust
	};
	
	// make the canvas not look horrible on retina screens
	canvas.width = width*2;
	canvas.height = height*2;
	canvas.style.width = width.toString().concat('px');
	canvas.style.height = height.toString().concat('px');
	
	// set the center x and y coordinates
	center = 
	{
		x: width,
		y: height
	};
}

// canvasId: id of canvas on page
// a_pos: either "centre" or "lower-right"
// show_hands: boolean to either show or hide hands initially
function init_clock(canvasId, a_pos, show_hands)
{
	canvas = document.getElementById(canvasId);
	// context = canvas.getContext('2d');
	
	if(a_pos)
		pos = a_pos;
	
	if(show_hands)
		open_clock();
	else
	{
		draw_blank_clock();
	}
	window.onresize = function(event) 
	{
		// draw_blank_clock();	 
		if(handTimer)
			draw_clock();
		else
			draw_blank_clock();
	};
	
	
	// chrome complains about this not being done of https
	window.addEventListener("deviceorientation", function(e) {
		var tilt = 0 - e.gamma;
		device_orientation_handler(tilt);
	}, false);
}

function device_orientation_handler(tilt)
{
	canvas.style.transform = " rotate("+ tilt +"deg)";
	canvas.style.webkitTransform  = " rotate("+ tilt +"deg)";
}

function draw_blank_clock()
{
	set_size();
	fill_bg();
	draw_circle();
}

function draw_clock()
{
	draw_blank_clock();
	draw_hands();
}

function open_clock()
{
	handTimer = 
		window.setInterval
		(
			function() 
			{
				draw_clock();
			}, 
			50
		);
}

function close_clock()
{
	window.clearInterval(handTimer);
	handTimer = false;
	draw_blank_clock();
}

function fill_bg(fill_colour)
{
	context = canvas.getContext('2d');
	context.strokeStyle = colours.bg;
	context.fillStyle = colours.bg;
	context.fillRect(0, 0, center.x*2, center.y*2);
}

function draw_circle(colour)
{
	if (colour) 
		context.strokeStyle = colour;
	else
		context.strokeStyle = colours.circle;
	
	context.lineCap = 'round';
	context.lineWidth = lineWidths.circle;
	context.beginPath();
	context.arc(center.x, center.y, r, 0, 2*Math.PI);
	context.stroke();
}

function draw_hands()
{
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	
	var rad = 
	{
		h: (((h % 12) + m / 60.0) / 6.0) * Math.PI - (Math.PI / 2.0),
		m: (m + s / 60.0) / 30.0 * Math.PI - (Math.PI / 2.0),
		s: s / 30.0 * Math.PI - (Math.PI / 2.0)
	};
	
	// smooth second hand (uses milliseconds)
	// var ms = d.getMilliseconds();  
	// rad.s = (s + ms / 1000.0) / 30.0 * Math.PI - (Math.PI / 2.0);
	
	for(k in rad)
	{
		context.beginPath();
		context.strokeStyle = colours[k];
		context.lineWidth = lineWidths[k];
		context.moveTo(center.x, center.y);
		context.lineTo(	Math.cos(rad[k]) * hands[k] + center.x, 
						Math.sin(rad[k]) * hands[k] + center.y);
		context.stroke();
	}
}

/*
function fill_circle()
{
	context.lineCap = 'round';
	context.fillStyle = "#ff0000";
	context.strokeStyle = "#ff0000";
	context.lineWidth = lineWidths.circle;
	context.beginPath();
	context.arc(center.x, center.y, r, 0, 2*Math.PI);
	context.stroke();
	context.fill();
}
*/