// based on http://jsfiddle.net/pc76H/2/

(function(){    
    var canvas, audio, ajax, source, analyser, sound, animation, w, h, context, button;
    var globalbuffer;
    var url = 'media/mp3/all-collected-voices_v1.mp3';
    var bufferLoader;   // may be unnec.
    
    function init(){
        // canvas
        var FF=2048/4;
        canvas=document.createElement('canvas');
        w=canvas.width=FF/2;
        h=canvas.height=200;
        context=canvas.getContext("2d");
        // document.body.appendChild(canvas);
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

        // document
        // button = document.createElement('button');
        // button.addEventListener('click', start, false);
        // document.body.appendChild(button);
        document.addEventListener('click', start, false);

        // load file
        requeststream(url);
        // loadbuffer();
        window.removeEventListener('load',init,false);
    }

    function progress(e){
        context.fillStyle='hsla('+(e.loaded/e.total*240)+',100%,50%,1)';
        context.fillRect(0,1,e.loaded/e.total*w,1);
    }
/*
    function buffer(){
        audio.decodeAudioData(this.response,start,function(){console.log('Decoding Error')});
    }
*/
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
            // context.fillStyle='hsla('+(b/c*240)+','+(y[b]/255*100|0)+'%,50%,1)';
            context.fillStyle='#000000';
            // context.fillRect(1*b,h-bh,1,bh); // spectrum
            context.fillRect(1*b,y[b],1,1);     // wave
        }
        window.requestAnimationFrame = window.requestAnimationFrame || window.$
        animation=requestAnimationFrame(animate);

        // animation=webkitRequestAnimationFrame(animate);
    }

    function readfile(e){
        var a=new FileReader();
        a.onload = function(e) {
            audio.decodeAudioData(a.result,start,function(){console.log('Decoding Error')});
        }
        a.readAsArrayBuffer(this.files[0]);
    }

    function start(e){
        source.buffer = globalbuffer;
        // source.noteOn(0);    // deprecated, use start();
        source.start(0);
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        animation=requestAnimationFrame(animate);
    }


    // new

    function requestfile(thisurl){
        var request = new XMLHttpRequest();
        request.open('GET', thisurl, true);
        // request.responseType = 'arraybuffer';    // problem to do w/responsetype
        request.addEventListener("load", requestfilelistener);
        /* 
        // not working, to do with loading binary data
        request.onload = function(e) {
            audio.decodeAudioData(request.result,start,function(){console.log('Decoding Error')});
        }
        */
        request.send();
    }

    function requeststream(thisurl){
        var request = new XMLHttpRequest();
        // request.addEventListener("load", requestfilelistener);
        request.open('GET', thisurl, true);
        request.responseType = 'arraybuffer';
        // decode async
        request.onload = function() {           
            audio.decodeAudioData(request.response, 
                function(buffer) {
                    globalbuffer = buffer;
                    console.log(globalbuffer);
                }, function(){
                    console.log('Decoding Error')
                });
        }
        request.send();
    }

    function requestfilelistener () {
        console.log(this.responseText);
    }
    


// not working, as does not find BufferLoader (prob mozilla specific)
function loadbuffer() {
  bufferLoader = new BufferLoader(audio, ['portauthority.mp3','portauthority.mp3'], finishedLoading);
  bufferLoader.load();
}

function finishedLoading(bufferList) {
  // create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];

  source1.connect(context.destination);
  source2.connect(context.destination);
  source1.start(0);
  source2.start(0);
}


    

    window.addEventListener('load',init,false);
})();
