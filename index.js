var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

var inherits = require('util').inherits;
var FFT = require('fft');
var stream = require('stream');
var Writable = stream.Writable ||
  require('readable-stream').Writable;

var speaker = new Speaker();
var lame = new lame.Decoder()


bitDepth = 16;
channels = 2;
//channels = 1;
samplesPerFrame = 44100;
blockAlign = bitDepth / 8 * channels;
chunkSize = blockAlign * samplesPerFrame;
chunkSize = chunkSize; // 2 channels 1 sec
chunkSize = chunkSize/4; // 2 channels 0.5 sec
//chunkSize = chunkSize/8; // 2 channels 0.25 sec


function SP(options) {  
  Writable.call(this, options); // init super
  this.cache = new Buffer([]); // empty  
  this.offset = 0;  
}
inherits(SP, Writable);



var fft = new FFT.complex(16, true);

//fft.process(output, outputOffset, outputStride, input, inputOffset, inputStride, type)

/* Or the simplified interface, which just sets the offsets to 0, and the strides to 1 */
//fft.simple(output, input, type)

var output = [];
var input = [];


SP.prototype._write = function (chunk, enc, done) {
  this.cache = Buffer.concat([this.cache, chunk]);
  vals = [];
  if (this.cache.length >= chunkSize) {
    input = [];
    output = [];
    for (var i = 0; i < chunkSize; i+=2) {
      input.push(this.cache.readUInt16LE(i));
    }
    fft.simple(output, input, "real");
    
    var tmp = new Buffer([]);
    this.cache.copy(tmp, 0, chunkSize+1);
    this.cache = tmp;
    //this.cache = this.cache.slice(0, chunkSize);
    //Math.max.apply(null, vals)
    io.emit('data', output);
    //console.log(bucket);
  }
  done();  
};

lame.pipe(new SP());




var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {  
});

setTimeout(function(){
  fs.createReadStream(process.argv[2])
    .pipe(lame)
    .on('format', console.log)
    .pipe(speaker);  
}, 3000);