<?
// namespace stuff
use \Michelf\Markdown;

// 1. split into sections based by '++'
// 2. trim whitespace
// 3. convert from markdown to html
function process_body($b)
{
	$body_parts = explode("++", $b);
	foreach($body_parts as &$b)
	{
		$b = trim($b);
		$b = Markdown::defaultTransform($b);
	}
	return $body_parts;
}
$oarr = $oo->get($uu->id);
$body = $oarr["body"];
$body_parts = process_body($body);
$media = $oo->media($uu->id);

// header (menu or breadcrumbs)

if($show_menu)
{
?><section id="body" class="hidden"><?
}
else
{
?><section id="body" class="visible"><?
}
?><div id="breadcrumbs">
		<ul class="nav-level">
			<li><?
				if(!$uu->id)
				{
				?>ALL: COLLECTED VOICES<?
				}
				else
				{
				?><a href="<? echo $host.$a_url; ?>">ALL: COLLECTED VOICES</a><?
				}
			?></li>
			<ul class="nav-level">
				<span><? // echo $name; ?></span>
			</ul>
		</ul>
	</div><?

// body

for($i = 0; $i < count($body_parts); $i++)
{
	if($i % 2 == 0)
	{
	?><div class="column-container-container"><?
	}
	?><div class="column-container"><?                 
		echo $body_parts[$i];
		if($i == 0)
		{
			$j = 0;
			foreach($media as $m)
			{
                // if media type == mp3 then insert html audio player
                if ($m[type] == 'mp3') {
                    $mp3_exists = TRUE;
                    ?><audio controls id='mp3' class='mp3-container' src='<? echo m_url($m); ?>' type='audio/mpeg'>
                         ** Sorry, your browser does not support the audio element. **
                    </audio><?
                } else {
                    // otherwise, display img 
                    ?><div><img src="<? echo m_url($m);?>" class="fullscreen"></div><?
                }
                // caption
                if ($m[caption]) 
                    ?><div class='caption'><? echo $m[caption]; ?></div><?   
            } 
		    $j++;
		}
	?></div><?
	if($i % 2 == 1)
	{
	?></div><?
	}
} 
?></section>

<!-- 
<script type="text/javascript" src="<? echo $host; ?>static/js/screenfull.js"></script>	
<script>
	var imgs = document.getElementsByClassName('fullscreen');
	var i;
	var index;
	for (i = 0; i < imgs.length; i++)
	{
		imgs[i].addEventListener('click', function () 
		{
			if (screenfull.enabled) {
				screenfull.toggle(this);
			}
			index = i;
			console.log(index);
		}, false);
	}
</script>
-->
