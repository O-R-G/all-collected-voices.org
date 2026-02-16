// based on http://jsfiddle.net/pc76H/2/
// requires <div id = 'analyzer'> as a container
// requires <div id = 'jingle'> or <div id = 'mp3'>

console.log("hello!");

class Analyzer {
    constructor(mp3) {
        if(!mp3 || !mp3.length) {
            console.log('mp3 is not found');
            return;
        }
        this.mp3 = mp3;
        this.audios = [];
        for(const m of this.mp3) {
            this.audios.push({
                'el': m,
                'ctx': null,
                'source': null,
                'analyser': null
            })
        }
        this.currentIdx = 0;
        this.currentMp3 = this.mp3[this.currentIdx];
        // this.currentMp3 = this.mp3[0];
        // console.log(this.currentMp3);
        
        this.canvas = null;
        // this.audio = null;
        this.ajax = null;
        // this.source = null;
        // this.analyser = null;
        this.sound = null;
        this.animation = null;
        this.w = null;
        this.h = null;
        this.context = null;
        this.button = null;
        this.globalbuffer = null;
        this.loaded = false;
        this.started = false;
        this.playing = false;
        this.url = 'media/mp3/all-collected-voices.mp3';
        this.FF = 2048 / 4; // frequency resolution
        this.debug = false;
        this.ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.w = this.canvas.width = this.FF / 2;
        this.h = this.canvas.height = 200;
        this.context = this.canvas.getContext("2d");
        var container = document.getElementById("analyzer");
        container.appendChild(this.canvas);

        this.startWebaudio();
        if (this.currentMp3.id === 'jingle') {
            document.addEventListener('click', this.playPause.bind(this), false);
        } else {
            this.addAudioListeners();
        }
    }

    startWebaudio() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        for(const data of this.audios) {
            const ctx = new AudioContext();
            console.log(data);
            const source = ctx.createMediaElementSource(data['el']);
            const analyser = ctx.createAnalyser();
            analyser.smoothingTimeConstant = 0.85;
            analyser.fftSize = this.FF;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            data['ctx'] = ctx;
            data['source'] = source;
            data['analyser'] = analyser;
            ctx.onstatechange = () => {
                if (this.debug) console.log("audio state change : " + ctx.state);
            };
        }
        this.animate();
        
    }
    // setAudio(){
    //     this.source = this.audios[this.currentIdx].ctx.createMediaElementSource(this.currentMp3);
    //     this.analyser = this.audios[this.currentIdx].ctx.createAnalyser();
    //     this.audios[this.currentIdx].analyser.smoothingTimeConstant = 0.85;
    //     this.audios[this.currentIdx].analyser.fftSize = this.FF;
    //     this.audios[this.currentIdx].source.connect(this.analyser);
    //     this.audios[this.currentIdx].analyser.connect(this.audios[this.currentIdx].ctx.destination);
    // }

    async playPause(audio) {
        if (this.currentMp3.paused) {
            this.handlePlay();
        } else {
            this.handlePause();
        }
    }

    async handlePlay(mp3) {
        if (this.playing && mp3 === this.currentMp3) return;
        if(mp3 !== this.currentMp3) {
            this.currentMp3.pause();
            this.updateCurrentMp3(mp3); 
        }
        await this.audios[this.currentIdx].ctx.resume();
        this.currentMp3.play();
        this.playing = true;
    }

    handlePause(mp3) {
        if (!this.playing) return;
        mp3.pause();
        this.playing = false;
    }

    start() {
        // start (desktop)
        // click to start (ios)
        if (!this.audios[this.currentIdx].source.buffer) this.audios[this.currentIdx].source.buffer = this.globalbuffer;
        if (this.debug) console.log("audio.state = " + this.audios[this.currentIdx].ctx.state);
        if (!this.started && !this.playing) {
            // ios -- init
            // osx -- init, start
            // start audio from time 0, start animation
            this.audios[this.currentIdx].source.start(0);
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            this.animation = requestAnimationFrame(this.animate.bind(this));
            this.started = true;
            if (this.audios[this.currentIdx].ctx.state === "running") this.playing = true;
            if (this.debug) alert("start");
        } else if (this.started && !this.playing) {
            // ios -- start
            this.audios[this.currentIdx].ctx.resume();
            this.animate();
            this.playing = true;
            if (this.debug) alert("resume start");
        } else if (this.started && this.playing) {
            // ios -- suspend
            // osx -- suspend
            this.audios[this.currentIdx].ctx.suspend();
            this.playing = false;
            if (this.debug) alert("suspend");
        }
    }

    animate() {
        console.log('a', this.currentIdx);
        var a = new Uint8Array(this.audios[this.currentIdx].analyser.frequencyBinCount);
        var y = new Uint8Array(this.audios[this.currentIdx].analyser.frequencyBinCount);
        var b, c, d;
        this.audios[this.currentIdx].analyser.getByteTimeDomainData(y);
        this.audios[this.currentIdx].analyser.getByteFrequencyData(a);
        b = c = a.length;
        d = this.w / c;
        this.context.clearRect(0, 0, this.w, this.h);
        while (b--) {
            // this.context.fillStyle='hsla('+(b/c*240)+','+(y[b]/255*100|0)+'%,50%,1)';     // rainbow
            this.context.fillStyle = '#000000'; // black
            // var bh=a[b]+1;                    // for spectrum only
            // this.context.fillRect(1*b,this.h-bh,1,bh); // spectrum
            this.context.fillRect(1 * b, y[b], 1, 1); // wave
        }
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        this.animation = requestAnimationFrame(this.animate.bind(this));
    }

    readfile(e) {
        var a = new FileReader();
        var target = e && e.target ? e.target : this;
        a.onload = () => {
            this.audios[this.currentIdx].ctx.decodeAudioData(a.result, this.start.bind(this), function() { console.log('Decoding Error'); });
        };
        a.readAsArrayBuffer(target.files[0]);
    }

    requeststream(thisurl) {
        var request = new XMLHttpRequest();
        request.addEventListener("progress", this.updateProgress.bind(this));
        request.addEventListener("load", this.requestfilelistener);
        request.open('GET', thisurl, true); // async = true
        request.responseType = 'arraybuffer';
        // decode async
        request.onload = () => {
            this.audios[this.currentIdx].ctx.decodeAudioData(
                request.response,
                (buffer) => {
                    this.globalbuffer = buffer;
                    console.log(this.globalbuffer);
                    this.loaded = true;
                    this.start(); // only on desktop
                },
                () => {
                    this.loaded = false;
                    console.log('Decoding error . . .');
                }
            );
        };
        request.send();
    }

    requestfilelistener() {
        console.log(this);
        console.log("status : " + this.statusText);
    }

    updateProgress(e) {
        if (e.lengthComputable) {
            var percentcomplete = e.loaded / e.total;
            if (this.debug) console.log("percentcomplete = " + percentcomplete);
            if (this.debug) console.log("e.loaded = " + e.loaded);
            this.context.fillRect(10, this.canvas.height * .64, this.canvas.width * percentcomplete, 1);
        } else {
            console.log("Unable to compute progress information as total size unknown");
        }
    }
    updateCurrentMp3(newMp3){
        for(let i = 0; i < this.audios.length; i++) {
            if(this.audios[i].el === newMp3) {
                this.currentIdx = i;
                this.currentMp3 = this.mp3[i];
                return i;
            }
        }
    }
    addAudioListeners() {
        for(const mp3 of this.mp3) {
            mp3.addEventListener('play', () => {
                this.handlePlay(mp3);
            });
        }
        for(const mp3 of this.mp3) {
            mp3.addEventListener('pause', () => {
                this.handlePause(mp3);
            });
        }
    }
}
// const mp3 = document.getElementById('mp3') || document.getElementById('jingle');
const mp3 = document.querySelectorAll('#body audio');
const analyzer = new Analyzer(mp3);
analyzer.init();
