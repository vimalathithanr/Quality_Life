<?php
ini_set('display_errors',1);
error_reporting(E_ALL | E_STRICT);

$config = parse_ini_file("../config.ini");
$host = $config['host'];
$user = $config['user'];
$pass = $config['pass'];
$db = $config['db'];


if($host == 'local')
	$con=mysqli_connect('localhost','root','mysql','QLife');
else
	$con=mysqli_connect($host,$user,$pass,$db);

if (mysqli_connect_errno())
{
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}


$data = array();


$result = mysqli_query($con,"select t1.UserID,t2.UserID,sum(least(t1.Duration,t2.Duration)) ". 
							"from QUserDetails t1 left outer join QUserDetails t2 on ". 
							"t1.ActivityID = t2.ActivityID and t1.UserID <> t2.UserID ".
							"group by t1.UserID,t2.UserID ".
							"order by t1.UserID,t1.ActivityID");

while($row = mysqli_fetch_array($result))
{
	$data[] = array_combine(array('UserID1', 'UserID2', 'Duration'),
			array($row[0],$row[1],$row[2]));
}

echo json_encode($data);

mysqli_close($con);


?>