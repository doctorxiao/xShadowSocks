
console.log(getRC4("QWERTYUIOP",new Buffer("123456789")))

function getRC4(strkey,data)
{
    var keylen=strkey.length;
    var s=new Array(256);
	var key=new Array(keylen);
	var bufkey=new Buffer(strkey,'ascii');
	var t=new Array(256);
	var keystream=new Array(data.length);
	var resultarray=new Array(data.length);
	var result=new Buffer(data.length);
	var j=0;
	var tmp=0;
	for(var i=0;i<keylen;i++)
	{
	    key[i]=bufkey.readUInt8(i);
	}
	for(var i=0;i<256;i++)
	{
	    s[i]=i;
	}
	for(var i=0;i<256;i++)
	{
	    j=(j+s[i]+key[i%keylen])%256;
		tmp=s[i];
		s[i]=s[j];
		s[j]=tmp;
	}
	var i=0;
	var k=0;
	j=0;
	while (k<data.length)
	{
	    i=(i+1)%256;
		j=(j+s[i])%256;
		tmp=s[i];
		s[i]=s[j];
		s[j]=tmp;
		keystream[k++]=s[(s[i]+s[j])%256];
	}
	for (var i=0;i<data.length;i++)
	{
	    resultarray[i]=data.readUInt8(i);
		result.writeUInt8(resultarray[i]^keystream[i],i);
	}
	i=null;
	j=null;
	k=null;
	bufkey=null;
	data=null;
	s=null;
	t=null;
	keystream=null;
	key=null;
	resultarray=null;
	return result;
}