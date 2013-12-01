<?php
ini_set('display_errors',1);
error_reporting(E_ALL | E_STRICT);

$config = parse_ini_file("../config.ini");
$host = $config['host'];
$user = $config['user'];
$pass = $config['pass'];
$db = $config['db'];

$con=mysqli_connect($host,$user,$pass,$db);

if (mysqli_connect_errno())
{
	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}


$data = array();


$result = mysqli_query($con,"select t1.UserID, t2.UserName, sum(t1.Duration) ".
							"from QUserDetails t1, QUsers t2 where ".
							"t1.UserID = t2.RFID group by UserID");

while($row = mysqli_fetch_array($result))
{
	$data[] = array_combine(array('UserID', 'UserName', 'Duration'),
			array($row[0],$row[1],$row[2]));
}

echo json_encode($data);

mysqli_close($con);


?>