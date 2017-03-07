<?php
// I'm pretty sure this entire class implementation is useless
class Request
{
	public $page = ''; 	// is this variable even used?
		
	/* [add, edit] post variables */
	public $name1;
	public $deck;
	public $body;
	public $notes;
	public $begin;
	public $end;
	public $url;
	public $rank;
	
	/* [add, delete, edit, link] */
	public $submit;
	public $action;
	
	public $m; // media id
	public $medias; // array
	public $types;
	public $captions;
	public $ranks;
	public $deletes;
		
	/* link */
	public $wires_toid;
	
	function __construct()
	{
		$this->page = basename($_SERVER['PHP_SELF'], ".php");
		
		// post variables
		$vars = array(	'name1', 'deck', 'body', 'notes', 'begin', 'end', 'url', 'rank',
						'medias', 'types', 'captions', 'ranks', 'deletes',
						'action', 'submit',
						'wires_toid');

		foreach($vars as $v)	
			$this->$v = $_POST[$v];
	}
}
?>