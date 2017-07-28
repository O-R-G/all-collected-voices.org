// based on http://jsfiddle.net/pc76H/2/
// requires <div id = 'analyzer'> as a container
// ** todo ** pass url as a parameter to init()

(function(){    
    var canvas, audio, ajax, source, analyser, sound, animation, w, h, context, button;
    var globalbuffer;
    var loaded, started, playing;
    var mp3;
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

        // set audio src url
        if (mp3 = document.getElementById("mp3")) {
            url = mp3.src;
            if (debug) console.log("====> " + url);
        }

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
        if (!source.buffer) source.buffer = globalbuffer;
        if (debug) console.log("audio.state = " + audio.state);

        if (!started && !playing) {
            // ios -- init
            // osx -- init, start  
            // start audio from time 0, start animation
            source.start(0);
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            animation = requestAnimationFrame(animate);
            started = true;
            if (audio.state == "running") playing = true;
	        if (debug) alert("start");
        } else if (started && !playing) {
            // ios -- start
            audio.resume();
            playing = true;
	        if (debug) alert("resume start");
        } else if (started && playing) {	    
            // ios -- suspend
            // osx -- suspend
            audio.suspend();
            playing = false;
    	    if (debug) alert("suspend");
        } 
    }

    function requeststream(thisurl){
        var request = new XMLHttpRequest();
        request.addEventListener("progress", updateprogress);
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
                    start();        // only on desktop                                    
                }, function(){
                    loaded = false;
                    console.log('Decoding error . . .')
                });
        }
        request.send();
    }

    function requestfilelistener () {
        console.log(this);
        console.log("status : " + this.statusText);
    }

    function updateprogress (e) {
        if (e.lengthComputable) {
            var percentcomplete = e.loaded / e.total;
            if (debug) console.log("percentcomplete = " + percentcomplete);
            if (debug) console.log("e.loaded = " + e.loaded)
            context.fillRect(10,canvas.height*.64,canvas.width*percentcomplete,1);
        } else {
            console.log("Unable to compute progress information as total size unknown");
        }
    }
    
    window.addEventListener('load',init,false);
})();
