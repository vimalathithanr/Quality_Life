var users;
var relations;
var screen;
var SVGArea;
var drag;
var gSelectedUser;
var gPinRadius;

var ALREADY_EXISTS = false;

function newXHR()
{
	if (window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");
}



function Init()
{
	screen = {
			"width":window.innerWidth,
			"height":window.innerHeight,
			"x":window.innerWidth/2,
			"y":window.innerHeight/2
	};
	
	gPinRadius = 20;
	
	//http://stackoverflow.com/questions/15966256/how-to-set-the-origin-drag-origin-for-drag-behavior-in-d3-javascript-library
	drag = d3.behavior.drag()
			.origin(function(d){
				var t = d3.select(this);
				return {
					x:t.attr("x") + d3.transform(t.attr("transform")).translate[0],
					y:t.attr("y") + d3.transform(t.attr("transform")).translate[1]
				};
			})
			.on("drag",function(d){
				d3.select(this)
					.attr("transform", function(d){
						return "translate(" + [d3.event.x,d3.event.y] + ")";						
					});
			});
	
	GetUserDetails();
	GetUserRelations();
	
	SVGArea = svgOverlay = d3.select("body")
							.append("svg")
							.attr("id","mainSVG")
							.attr("width",screen.width)
							.attr("height",screen.height);
	
	
	DrawUserObjects();
	DrawUserLinks()
	
	RandomPerturb();

}



function GetUserDetails()
{
	var xmlhttp = newXHR();
	
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			//alert(xmlhttp.responseText);
			var data = JSON.parse(xmlhttp.responseText);
			
			users = [];
			
			for(i=0;i<data.length;i++)
			{
				users[i] = {"id":"u"+data[i].UserID,
							"name":data[i].UserName,
							"duration":data[i].Duration,
							"x":screen.x,
							"y":screen.y};
			}		
		}
	}
	
	xmlhttp.open("POST","php/UserDetails.php",false);
	xmlhttp.send();
}



function GetUserRelations()
{
	var xmlhttp = newXHR();
	
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			//alert(xmlhttp.responseText);
			var data = JSON.parse(xmlhttp.responseText);
			
			relations = [];
			
			for(i=0;i<data.length;i++)
			{
				ALREADY_EXISTS = false;
				
				for(j=0;j<relations.length;j++)
				{
					if(data[i].UserID1 == relations[j].to)
					{
						ALREADY_EXISTS = true;
						break;
					}
				}
				
				if(!ALREADY_EXISTS)
				{

					relations.push({"from":"u"+data[i].UserID1,
							"to":"u"+data[i].UserID2,
							"duration":data[i].Duration});
				}
			}
		}
	}
	
	xmlhttp.open("POST","php/UserRelations.php",false);
	xmlhttp.send();
}


function DrawUserObjects()
{
	var UserGroup = SVGArea.selectAll("g")
							.data(users)
							.enter()
							.append("g")
							.attr("id",function(d){return d.id;})
							.on("click", function(d){
								 SelectUser(d.id);				 
							 })
							 .call(drag);

	var UserIcons = UserGroup.append("circle");
							
	var UserImages = UserGroup.append("image");
	
	//var UserLinks = SVGArea.append("path");
	
	
	UserIcons.attr("cx",screen.x)
			 .attr("cy",screen.y)
			 .attr("r",gPinRadius)
			 .attr("class","icon");
			 

	UserImages.attr("xlink:href", "images/user.png")
				.attr("width","1")
				.attr("height","1")
				.attr("x",function(d){return d.x-15;})
				.attr("y", function(d){return d.y-15;});
				

	
	var phi = 2*Math.PI/users.length;
	var sep_rad = 0.35*screen.height;				//separation radius
	var max_rad = screen.height*1.5/users.length;	//max usericon radius
	var total_duration = 0;
	
	for(i=0;i<users.length;i++)
	{		
		users[i].x = screen.x + sep_rad*Math.cos(i*phi);
		users[i].y = screen.y + sep_rad*Math.sin(i*phi);
		total_duration += parseInt(users[i].duration);
	}

	UserIcons.transition()
			.attr("cx",function(d){return d.x;})
			.attr("cy", function(d){return d.y;})
			.attr("r", function(d){
				return max_rad*parseInt(d.duration)/total_duration;
			})
			.duration(1000);
	

	UserImages.transition()
			   .attr("width","30")
			   .attr("height","30")
			   .attr("x",function(d){return d.x-15;})
			   .attr("y", function(d){return d.y-15;})
			   .duration(1000);
	
	
	
	//UserLinks.transition()
	/*UserLinks.transition()
			.attr("d",function(d){
				var x1 = d3.select("#"+d.from).attr("cx");
				var y1 = d3.select("#"+d.from).attr("cy");
				var x2 = d3.select("#"+d.to).attr("cx");
				var y2 = d3.select("#"+d.to).attr("cy");
			
				for(i=0;i<users.length;i++)
				{
					if(users[i].id == d.from)
					{
						x1 = users[i].x;
						y1 = users[i].y;
					}
					
					if(users[i].id == d.to)
					{
						x2 = users[i].x;
						y2 = users[i].y;
					}
				}
					
				return "M " + x1 + " " + y1 + " L " + x2 + " " +y2;
		});*/
	
}


function DrawUserLinks()
{
	
	var UserLinks = SVGArea.selectAll("path")
						.data(relations)
						.enter()
						.append("path");
	
	var line = d3.svg.line()
					.x(function(d){return d.x;})
					.y(function(d){return d.y;})
					.interpolate("linear");
	
	UserLinks.attr("d",function(d){
		
		var points = [];
		var from,to;
		
		for(i=0;i<users.length;i++)
		{
			if(d.from == users[i].id)
				from = {"x":users[i].x,"y":users[i].y};
			
			if(d.to == users[i].id)
				to = {"x":users[i].x,"y":users[i].y};
			
		}
		
		points.push(from);
		points.push(to);
		
		console.log(points)
		
		return line(points);
	});
	
	UserLinks.attr("stroke","black");
}


function SelectUser(uid)
{
	uid = "#" + uid;
	
	if(d3.select(uid).attr("id") == gSelectedUser)
		return;
		
	d3.select("#pinGroup").remove();
	
	var usergroup = d3.select(uid);
	var icon = usergroup.select(".icon");
	

	if(gSelectedUser)
	{		
		if(d3.select(uid).attr("id") != gSelectedUser)
		{
			d3.select("#"+gSelectedUser)
				.select(".icon")
				.transition()
				.style("stroke-width","1")
				.style("fill", function(d){
					return d3.select(this).style("stroke");
					})
				.style("stroke", "black");
		}
	}
	
	
	icon.transition()
 		.style("stroke",icon.style("fill"))
 		.style("stroke-width",0.2*icon.attr("r"))
 		.style("fill","transparent");
	
	gSelectedUser = d3.select(uid).attr("id");
	
	var cx = parseFloat(icon.attr("cx"));
	var cy = parseFloat(icon.attr("cy"));
	var r = parseFloat(icon.attr("r"));
	
	cx = cx + r*Math.cos(2*Math.PI*7/8);
	cy = cy + r*Math.sin(2*Math.PI*7/8);
	
	
	var pinGroup = usergroup.append("g").attr("id","pinGroup");
					
	pinGroup.transition()
		.attr("x",cx)
		.attr("y",cy)
		.duration(2000);
	
	var pin = pinGroup.append("circle")
				.attr("class", "pin")
				.attr("r",0)
				.attr("cx",cx)
				.attr("cy",cy);
	
	
	pin.transition()
		.attr("r",gPinRadius);

	
	var pintext = pinGroup.append("text");
	
	pintext.attr("class","pintext")
			.attr("x",cx)
			.attr("y",cy)
			.text(function() {
				for(i=0;i<users.length;i++)
				{
					if(users[i].id == gSelectedUser)
						return users[i].duration;
				}
			});
						
			
}




function RandomPerturb()
{
	d3.select("#u52005629f3").transition()
		.attr("transform", "translate(50,50)")
		.duration(10000);
}



function RandomColor()
{
	var chars = ["0","1","2","3","4","5","6","7","8","9","10","A","B","C","D","E","F"];
	var color = "#";
	
	for(i=0;i<6;i++)
	{
		var idx = Math.floor((Math.random()*100)%15);
		
		color += chars[idx];
	}	
	
	console.log(color)
	return color;
	
}




