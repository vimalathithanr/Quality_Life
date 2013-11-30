var users;
var relations;
var screen;
var SVGArea;

var drag;
var line;

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
	
	line = d3.svg.line()
			.x(function(d){return d.x;})
			.y(function(d){return d.y;})
			.interpolate("linear");
	
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
				
				UpdateLinks(this);
							
			});
	
	GetUserDetails();
	GetUserRelations();
	
	SVGArea = svgOverlay = d3.select("body")
							.append("svg")
							.attr("id","mainSVG")
							.attr("width",screen.width)
							.attr("height",screen.height);
	
	AssignInitPositions();
	DrawUserObjects();
	
	//RandomPerturb();

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
					if("u"+data[i].UserID1 == relations[j].to && 
							"u"+data[i].UserID2 == relations[j].from)
					{
						ALREADY_EXISTS = true;
						break;
					}
				}
				
				if(!ALREADY_EXISTS)
				{
					//console.log(data[i].UserID1,data[i].UserID2);
					relations.push({"id":"p"+relations.length,
							"from":"u"+data[i].UserID1,
							"to":"u"+data[i].UserID2,
							"duration":data[i].Duration});
				}
			}
		}
	}
	
	xmlhttp.open("POST","php/UserRelations.php",false);
	xmlhttp.send();
}



function AssignInitPositions()
{
	var phi = 2*Math.PI/users.length;
	var sep_rad = 0.35*screen.height;				//separation radius
	var points = [];
	var from,to;
	
	for(i=0;i<users.length;i++)
	{		
		users[i].x = screen.x + sep_rad*Math.cos(i*phi);
		users[i].y = screen.y + sep_rad*Math.sin(i*phi);
	}
	
	var UserLinks = SVGArea.selectAll("path")
							.data(relations)
							.enter()
							.append("path")
							.attr("id",function(d){ return d.id; });


	/*UserLinks.attr("d",function(d){

		points = [];
	
		for(i=0;i<users.length;i++)
		{
			if(d.from == users[i].id)
				from = {"x":users[i].x,"y":users[i].y};
		}
	
		points.push(from);
		points.push(from);
	
		return line(points);
	});*/

	
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
		
	
	UserIcons.attr("cx",screen.x)
			 .attr("cy",screen.y)
			 .attr("r",gPinRadius)
			 .attr("class","icon");
			 

	UserImages.attr("xlink:href", "images/user.png")
				.attr("width","1")
				.attr("height","1")
				.attr("x",function(d){return d.x-15;})
				.attr("y", function(d){return d.y-15;});
				

	
	var max_rad = screen.height*1.5/users.length;	//max usericon radius
	var total_duration = 0;
	
	for(i=0;i<users.length;i++)
		total_duration += parseInt(users[i].duration);


	UserIcons.transition()
			.attr("cx",function(d){return d.x;})
			.attr("cy", function(d){return d.y;})
			.attr("r", function(d){
				return max_rad*parseInt(d.duration)/total_duration;
			})
			.duration(1000)
			.each("end",function(d){
				DrawUserLinks();
				UserImages.transition()
				   .attr("width","30")
				   .attr("height","30");
			});
		
}




function DrawUserLinks()
{
	
	UserLinks = d3.selectAll("path");
	
	UserLinks.attr("d",function(d){

		points = [];
	
		for(i=0;i<users.length;i++)
		{
			if(d.from == users[i].id)
				from = {"x":users[i].x,"y":users[i].y};
		}
	
		points.push(from);
		points.push(from);
	
		return line(points);
	});


	UserLinks.transition().attr("d",function(d){

		points = [];
			
		for(i=0;i<users.length;i++)
		{
			if(d.from == users[i].id)
				from = {"x":users[i].x,"y":users[i].y};
			
			if(d.to == users[i].id)
				to = {"x":users[i].x,"y":users[i].y};
		}
		
		points.push(from);
		points.push(to);
		

		return line(points);
	})
		.duration(1000);
		

	
	UserLinks.attr("stroke","black")
			.attr("stroke-width","2");
}





function UpdateLinks(svgroup)
{	
	console.log(svgroup);
	var uid = d3.select(svgroup).attr("id");
	var offx = d3.transform(d3.select(svgroup).attr("transform")).translate[0];
	var offy = d3.transform(d3.select(svgroup).attr("transform")).translate[1];
	var x = d3.select(svgroup).select(".icon").attr("cx");
	var y = d3.select(svgroup).select(".icon").attr("cy");
	
	var path, from, to, points, tmp, flag, oldx, oldy;
	
	x = parseFloat(x) + parseFloat(offx);
	y = parseFloat(y) + parseFloat(offy);
	
	
	for(i=0;i<relations.length;i++)
	{
		flag = 0;
		
		if(uid == relations[i].from)
		{			
			path = d3.select("#p"+i);
			tmp = d3.select("#"+relations[i].to);
			from = {"x":x,"y":y};
			flag = 1;
		}
		
		if(uid == relations[i].to)
		{			
			path = d3.select("#p"+i);
			tmp = d3.select("#"+relations[i].from);
			to = {"x":x,"y":y};
			flag = 2;
		}
		
		if(flag > 0)
		{
			points = [];
			
			offx = d3.transform(tmp.attr("transform")).translate[0];
			offy = d3.transform(tmp.attr("transform")).translate[1];
			oldx = tmp.select(".icon").attr("cx");
			oldy = tmp.select(".icon").attr("cy");
			
			oldx = parseFloat(oldx) + parseFloat(offx);
			oldy = parseFloat(oldy) + parseFloat(offy);
			
			if(flag == 2)
				from = {"x":oldx,"y":oldy};
			else
				to = {"x":oldx,"y":oldy};
			
			path.attr("d",function(d){
			
				points.push(from);
				points.push(to);
				
				return line(points);
			});
		}
					
	}

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
 		.style("fill","white");
	
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
	
	var nametag = d3.select("#nametag");
	
	var nwidth = parseFloat(nametag.style("width").replace("px",""));
	var nheight = parseFloat(nametag.style("height").replace("px",""));
	
	console.log(nwidth,nheight)
	
	nametag.style("left",cx - (nwidth/2) + "px")
			.style("top", cy + (r+nheight)+"px")
			.style("opacity","1");
			
}




function RandomPerturb()
{
	d3.select("#u52005629f3").transition()
		.attr("transform", function(d){
			UpdateLinks(d3.select("#u52005629f3")[0][0]);	
		return "translate(50,50)";})
		.duration(10000);
	
	//console.log(d3.select("#u52005629f3")[0][0]);
	//UpdateLinks(d3.select("#u52005629f3")[0][0]);
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




