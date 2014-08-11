var express = require('express');
var net = require("net");
var inet = require("./inet");
//var Encryptor = require("./encrypt").Encryptor;
var crypto=require('crypto');
var portnum=5000;

var app = express();
var pwdtime = new Array(portnum);
for (var i=0;i<portnum;i++)
{
    pwdtime[i]=new Array(5);
}

app.get('/', function(req, res){
    res.send('Hello World');
});

app.get('/newport', function(req, res){
    var ip=getClientIp(req);
	for(var i=0;i<portnum;i++)
	{
	    if (pwdtime[i][3]<Date.parse(new Date()) || pwdtime[i][4]>1024*1024*500)
		{
				pwdtime[i][0]=null;
				pwdtime[i][1]=null;
				pwdtime[i][2]=null;
				pwdtime[i][3]=0;
				pwdtime[i][4]=10000;
		}
	}
	for(var i=0;i<portnum;i++)
	{
	    if (pwdtime[i][0]==ip)
		{
		    res.send('server:"107.170.214.39"<br />'+'port:10000<br >password:'+pwdtime[i][1]+"<br />method:rc4");
			return ;
		}
	}
	var tmpid=0;
    for(var i=0;i<portnum;i++)
	{
		if (pwdtime[i][0]==undefined)
	    {
			tmpid=i;
		    pwdtime[i][0]=ip;
			pwdtime[i][1]=randomString(10);
		    pwdtime[i][2]=Date.parse(new Date())+60*60*1000;
			pwdtime[i][3]=0;
			pwdtime[i][4]=10000;
			break;
		}
	}
	res.send('server:"107.170.214.39"<br />'+'port:10000<br >password:'+pwdtime[tmpid][1]+"<br />method:rc4");
})

var server = net.createServer(function(connection) {
    var cryd;
	var cryc;
	var key="";
	var state=0;
	var tmp=0;
	for (var i=0;i<pwdtime.length;i++)
	{
		if (connection.remoteAddress==pwdtime[i][0])
		{
		    if (pwdtime[i][2]<Date.parse(new Date()))
			{
			    connection.end();
			    return ;
			}
			key=pwdtime[i][1];
			tmp=i;
			cryc=crypto.createCipher('rc4', key);
			cryd=crypto.createDecipher('rc4', key);	
			break;
		}
	}
	var remote=new net.Socket();
	remote.on("data", function(fdata) {
	    try{
		    pwdtime[tmp][3]=pwdtime[tmp][3]+fdata.length;
            var fdata1 = cryc.update(fdata);
            connection.write(fdata1);
		    fdata=null;
			fdata1=null;
		}
		catch (error)
        {
		    
		}		
    });
	remote.on("end", function() {
	    try
		{
		    connection.end();
		}
		catch (error)
		{
		
		}
    });
    remote.on("error", function(e) {
        try
		{
		    remote.end();
		}
		catch (error)
		{
		
		}
    });
	remote.setTimeout(15 * 1000, function() {
	    //console.log("remote timeout");
		try
		{
		    remote.end();
			connection.end();
		}
		catch (error)
		{}
	})
	connection.setTimeout(15 * 1000, function() {
	    //console.log("connection timeout");
		try
		{
		    remote.end();
			connection.end();
		}
		catch (error)
		{}
	})
    connection.on("close", function(had_error) {
        try
		{
			cry=null;
			key=null;
			state=null;
			tmp=null;
			remote=null;
			connection=null;
			cryc=null;
			cryd=null;
			remote.end();
			remote.destroy();
			connection.destroy();
		}
		catch (error)
		{
		
		}
    });
	connection.on("end", function() {
	    try
		{
		    cry=null;
			key=null;
			state=null;
			tmp=null;
			remote=null;
			connection=null;
			cryc=null;
			cryd=null;
			remote.end();
		}
		catch (error)
		{
		
		}
    });
    connection.on("error", function(e) {
        try
		{
		    remote.end();
			connect.end();
		}
		catch (error)
		{
		
		}
    });
    remote.on("close", function(had_error) {
        try
		{
		    connection.end();
			connection.destroy();
			remote.destroy();
		}
		catch (error)
		{
		
		}
    });
	connection.on("data", function(datax) {
	    if (state==0)
		{
		    if (key=="")
		    {
	 	        connection.end();
	     		return ;
	        }
            //cry=new Encryptor(key ,'aes-256-cfb');	
			var data = cryd.update(datax);
			//console.log(data.toString("utf8"))
			pwdtime[tmp][3]=pwdtime[tmp][3]+datax.length;
			addrtype = data[0];
            if (addrtype === void 0) {
                return;
            }
            if (addrtype === 3) {
                addrLen = data[1];
            } else if (addrtype !== 1 && addrtype !== 4) {
                connection.destroy();
                return;
            }
            if (addrtype === 1) {
                remoteAddr = inetNtoa(data.slice(1, 5));
                remotePort = data.readUInt16BE(5);
                headerLength = 7;
            } else if (addrtype === 4) {
                remoteAddr = inet.inet_ntop(data.slice(1, 17));
                remotePort = data.readUInt16BE(17);
                headerLength = 19;
            } else {
                remoteAddr = data.slice(2, 2 + addrLen).toString("binary");
                remotePort = data.readUInt16BE(2 + addrLen);
                headerLength = 2 + addrLen + 2;
            }
			remote.connect(remotePort, remoteAddr, function() {
				//console.log("connect:"+remoteAddr+remotePort);
			});
			state=1;
			if (data.length>headerLength)
			{
				var buf = new Buffer(data.length - headerLength);
                data.copy(buf, 0, headerLength);
				remote.write(buf);
				//console.log("1:"+buf.toString("utf8"));
				buf=null;
			}
			data=null;
		} else
		{		
			var data = cryd.update(datax);
			remote.write(data);
			//console.log("2:"+data.toString("utf8"));
			data=null;
		}
		datax=null;
	})
})

server.listen(10000);

//setInterval(printnum,1000);

function printnum()
{
   console.log(server.connections);
}

var webserver = app.listen(3000, function() {
    
});


function randomString(len) {
　　len = len || 32;
　　var xchars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnoprstuvwxyz1234567890';
　　var maxPos = xchars.length;
　　var pwd = '';
　　for (var i = 0; i < len; i++) {
　　　　pwd += xchars.charAt(Math.floor(Math.random() * maxPos));
　　}
    len=null;
    xchars=null;
    maxPos=null;
	i=null;
　　return pwd;
}

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
    req.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

function inetNtoa (buf) {
    return buf[0] + "." + buf[1] + "." + buf[2] + "." + buf[3];
};