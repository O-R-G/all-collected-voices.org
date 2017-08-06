// based on http://jsfiddle.net/pc76H/2/
// requires <div id = 'analyzer'> as a container
// requires <div id = 'jingle'> or <div id = 'mp3'>

// (function(){

    var canvas, audio, ajax, source, analyser, sound, animation, w, h, context, button;
    var globalbuffer;
    var loaded, started, playing;
    var mp3;
    var FF = 2048/4;    // for size, and frequency sampling
    var url = 'media/mp3/all-collected-voices.mp3';
    var debug = false;
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    function init(){
        // canvas
        canvas=document.createElement('canvas');
        w=canvas.width=FF/2;
        h=canvas.height=200;
        context=canvas.getContext("2d");
        var container = document.getElementById("analyzer");
        container.appendChild(canvas);

        if (ios)
            console.log('ios');  
            // document.getElementById('mp3').addEventListener('touchstart', init_webaudio, false);
            // document.addEventListener('touchstart', init_webaudio, false);   
        else
            console.log('osx');  
            // init_webaudio();
            
        // could set timeout to check if playing?
/*
vid.oncanplay = function() {
    alert("Can start playing video");
};
*/
        document.getElementById('play_pause_button').addEventListener('click', init_webaudio, false);
        window.removeEventListener('load',init,false);
    }

    function init_webaudio() {
        alert('init_webaudio');
        // webaudio    
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audio = new AudioContext();

        // ios audio.createMediaElementSource does not connect to analyser (bug)
        // https://bugs.chromium.org/p/chromium/issues/detail?id=112368

        // if (ios) {           
        alert('ios = ' + ios); 
        if (!ios) {             // temp!
            source = audio.createBufferSource();
            requeststream(url);
            alert(url);
        } else {
            mp3 = document.getElementById('mp3');
            if (!mp3)
                mp3 = document.getElementById('jingle');
            source = audio.createMediaElementSource(mp3);
        }
        analyser = audio.createAnalyser();
        analyser.smoothingTimeConstant = 0.85;
        analyser.fftSize = FF;
        source.connect(analyser);
        analyser.connect(audio.destination);
            
        if (ios) {
            animate();  
            // note.on();
            source.start(0);
            // start();
        } else {
            animate();
            if (mp3.id=='jingle')
                mp3.play(); 
        }

        audio.onstatechange = function() {
            if (debug) console.log("audio state change : " + audio.state);
        }    
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
            // source.start(0);
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

    function play_pause(e){
        if (!playing) {
            mp3.play();
            animate();
            playing = true;                
        } else {
            mp3.pause();
            playing = true;                
        }
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
            // context.fillStyle='hsla('+(b/c*240)+','+(y[b]/255*100|0)+'%,50%,1)';     // rainbow
            context.fillStyle='#000000';        // black
            // var bh=a[b]+1;                   // for spectrum only
            // context.fillRect(1*b,h-bh,1,bh); // spectrum
            context.fillRect(1*b,y[b],1,1);     // wave
        }
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        animation=requestAnimationFrame(animate);
    }

    function readfile(e){
        var a=new FileReader();
        a.onload = function(e) {
            audio.decodeAudioData(a.result,start,function(){console.log('Decoding Error')});
        }
        a.readAsArrayBuffer(this.files[0]);
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

    /* end deprecated */
    
    // load script only once doc is loaded
    window.addEventListener('load',init,false);

// })();
