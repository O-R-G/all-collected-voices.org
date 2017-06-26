// based on http://jsfiddle.net/pc76H/2/
// requires <div id = 'anayzer'> as a container
// *todo* pass url as a parameter to init()

(function(){    
    var canvas, audio, ajax, source, analyser, sound, animation, w, h, context, button;
    var globalbuffer;
    var loaded, started, paused;
    var url = 'media/mp3/all-collected-voices.mp3';
    var debug = false;

    function init(){
        // canvas
        var FF=2048/4;
        canvas=document.createElement('canvas');
        w=canvas.width=FF/2;
        h=canvas.height=200;
        context=canvas.getContext("2d");
        var container = document.getElementById("analyzer");
        container.appendChild(canvas);

        // webaudio
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audio = new AudioContext();
        source = audio.createBufferSource();
        analyser = audio.createAnalyser();
        analyser.smoothingTimeConstant = 0.85;
        analyser.fftSize = FF; 
        source.connect(analyser);
        analyser.connect(audio.destination);

        // status
        audio.onstatechange = function() {
            console.log("audio state change : " + audio.state);
        }

        // document
        document.addEventListener('click', start, false);
        // document.addEventListener('click', function () { alert('click'); }, false);

        // load file
        requeststream(url);
        window.removeEventListener('load',init,false);
    }

    function animate(){
        var a = new Uint8Array(analyser.frequencyBinCount);
        var y = new Uint8Array(analyser.frequencyBinCount);
        var b, c, d;
        analyser.getByteTimeDomainData(y);
        analyser.getByteFrequencyData(a);
        b = c = a.length;
        d = w / c;
        context.clearRect(0, 0, w, h);
        while(b--){
            var bh=a[b]+1;
            // context.fillStyle='hsla('+(b/c*240)+','+(y[b]/255*100|0)+'%,50%,1)';     // rainbow
            context.fillStyle='#000000';        // black
            // context.fillRect(1*b,h-bh,1,bh); // spectrum
            context.fillRect(1*b,y[b],1,1);     // wave
        }
        window.requestAnimationFrame = window.requestAnimationFrame || window.$
        animation=requestAnimationFrame(animate);
    }

    function readfile(e){
        var a=new FileReader();
        a.onload = function(e) {
            audio.decodeAudioData(a.result,start,function(){console.log('Decoding Error')});
        }
        a.readAsArrayBuffer(this.files[0]);
    }

    function start(e){
        // start (desktop)
        // click to start (ios)
        source.buffer = globalbuffer;
        if (debug) alert(audio.state + " " + started + " " + paused);

        if (audio.state == "running" && !started && !paused) {
            // start audio from time 0, start animation
	        if (debug) alert("start");
            source.start(0);
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            animation = requestAnimationFrame(animate);
            started = true;
            paused = false;
        } else if (audio.state == "suspended" && started && paused) {
            // resume audio, resume animation
	        if (debug) alert("resume");
            audio.resume();
            paused = false;
        } else if (audio.state == "suspended") {
            // * ios * resume, start audio, start animation
            // no further boolean qualifiers b/c async calls make it erratic
	        if (debug) alert("resume start");
            audio.resume();
            source.start(0);
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            animation = requestAnimationFrame(animate);
            started = true;
            paused = false;
        } else if (audio.state == "running" && started && !paused) {
            // suspend audio, suspend animation
	        if (debug) alert("suspend");
            audio.suspend();
            paused = true;
        }                
    }

    function requeststream(thisurl){
        var request = new XMLHttpRequest();
        request.addEventListener("load", requestfilelistener);
        request.open('GET', thisurl, true);     // async = true
        request.responseType = 'arraybuffer';
        // decode async
        request.onload = function() {           
            audio.decodeAudioData(request.response, 
                function(buffer) {
                    globalbuffer = buffer;
                    console.log(globalbuffer);
                    loaded = true;
                    start();        // does this need the event passed to it?
                                    // this will only work on desktop
                }, function(){
                    loaded = false;
                    console.log('Decoding error . . .')
                });
        }
        request.send();
    }

    function requestfilelistener () {
        console.log(this);
        console.log(this.statusText);
    }
    
    window.addEventListener('load',init,false);

})();
