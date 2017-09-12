<?
$sql = "select id from objects where url='settings'";
$settings_id = $db->query($sql)->fetch_assoc()['id'];
if($settings_id)
{
	$m = $oo->media($settings_id)[0];
	if($m)
	{
		$img = m_url($m);
		$img_alt = $img;
	}
	else
	{
		$img = "media/svg/yorick.svg";
		$img_alt = "media/svg/yorick-ex.svg";
	}
}
else {
	$img = "media/svg/blank.svg";
	$img_alt = "media/svg/blank.svg";
}
?><script type="text/javascript" src="<? echo $host; ?>static/js/global.js"></script>
<script type="text/javascript" src="<? echo $host; ?>static/js/clock.js"></script><?
if(!$uu->id)
{
?>
<div id="skull-container" class="v-centre">
	<!-- object id="skull" class="large skull visible h-centre" data="<? echo $img ?>"></object-->
	<img id="skull" class="large skull visible" src="<? echo $img ?>">
	<img id="ex" class="large skull ex hidden" src="<? echo $img_alt ?>">
</div><?
}
else
{
	if($show_menu)
	{
	?><div id="skull-container" class="lower-right">
		<img id="skull" class="small skull fade" src="<? echo $img; ?>">
		<img id="ex" class="small skull ex visible" src="<? echo $img_alt ?>">
	</div><?
	}
	else
	{
	?><div id="skull-container" class="lower-right">
		<img id="skull" class="small skull visible" src="<? echo $img; ?>">
		<img id="ex" class="small skull ex hidden" src="<? echo $img_alt ?>">
	</div><?
	}
}
?><script>
var isHidden;
<?
if($show_menu)
{ ?>isHidden = false;<? }
else
{ ?>isHidden = true;<? }
?>
// document.getElementById("skull-container").addEventListener("click", showHide);
document.addEventListener("click", showHide, false);
</script>
