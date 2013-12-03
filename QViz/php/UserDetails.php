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


/*$result = mysqli_query($con,"select t1.UserID, t2.UserName, sum(t1.Duration) ".
							"from QUserDetails t1, QUsers t2 where ".
							"t1.UserID = t2.RFID group by UserID order by 3 desc");
*/
$result = mysqli_query($con,"select t1.RFID, t1.UserName, IFNULL(sum(t2.Duration),0) from ".
							"QUsers t1  left outer join QUserDetails t2 ".
							"on t2.UserID = t1.RFID where t1.Active=1 group by t1.RFID order by 3 desc ");
		
while($row = mysqli_fetch_array($result))
{
	
	$photo = false;
	
	if(file_exists( '../images/img' . $row[0]. '.png'))
		$photo = true;
	
	$data[] = array_combine(array('UserID', 'UserName', 'Duration', 'Photo'),
			array($row[0],$row[1],$row[2], ($photo)?'true':'false'));
}

echo json_encode($data);

mysqli_close($con);


?>