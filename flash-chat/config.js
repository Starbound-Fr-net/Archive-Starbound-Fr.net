/*
 * lightIRC configuration
 * www.lightIRC.com
 *
 * You can add or change these parameters to customize lightIRC.
 * Please see the full parameters list at http://redmine.lightirc.com/projects/lightirc/wiki/Customization_parameters
 *
 */

var params = {};

/* Change these parameters */
params.realname                     = "Starbound-Fr - IRC";
params.host                         = "irc.chat4all.com";
params.port                         = 6667;

/* Language for the user interface. Currently available translations: ar, bd, bg, br, cz, da, de, el, en, es, et, fi, fr, hu, hr, id, it, ja, nl, no, pl, pt, ro, ru, sl, sq, sr_cyr, sr_lat, sv, th, tr, uk */
params.language                     = "fr";

/* Relative or absolute URL to a lightIRC CSS file.
 * The use of styles only works when you upload lightIRC to your webspace.
 * Example: css/lightblue.css 
 */
params.styleURL                     = "css/darkorange.css";

/* Nick to be used. A % character will be replaced by a random number */
params.nick                         = "";
params.rememberNickname		        = true;
/* Channel to be joined after connecting. Multiple channels can be added like this: #lightIRC,#test,#help */
params.autojoin                     = "#starbound-fr";
/* Commands to be executed after connecting. E.g.: /mode %nick% +x */
params.perform                      = "";

/* Whether the server window (and button) should be shown */
params.showServerWindow             = true;

/* Show a popup to enter a nickname */
params.showNickSelection            = true;
/* Adds a password field to the nick selection box */
params.showIdentifySelection        = true;

/* Show button to register a nickname */
params.showRegisterNicknameButton   = true;
/* Show button to register a channel */
params.showRegisterChannelButton    = false;

/* Opens new queries in background when set to true */
params.showNewQueriesInBackground   = false;

/* Position of the navigation container (where channel and query buttons appear). Valid values: left, right, top, bottom */
params.navigationPosition           = "bottom";

/* Smileys */
emoticonPath                        = "http://starbound-fr.net/chat/emoticons/"

params.emoticonList 				= ":noel:->noel.png,:excite:->excite.swf,:heureux:->heureux.png,:-)->sourire.png,:sadique:->sadique1.png,:oeil:->oeil.swf,:hum:->hum.png,:evil:->evil.swf,:science:->science.png,u_u->u_u.png,:disapoint:->disapoint.png,:sadique2:->sadique2.png,:pense:->pense.png,:naif:->naif.png,:pliz:->pliz.swf,:edente:->edente.png,x)->x).png,:coeur2:->coeur.swf,:sleep:->sleep.swf,:bierre:->bierre.png,:siffle:->siffle.swf,:bave:->bave.png,:malade:->malade.png,:rire:->rire.swf,:fail:->fail.png,:sriden:->sriden.swf,xd->xD.png,:langue:->langue.png,:susp2:->susp2.png,:pfiouf:->pfiouf.png,:ko:->ko.png,:ouch:->ouch.png,:gaffe:->gaffe.png,:fete:->fete.png,:salut:->salut.png,:ouch2:->ouch2.png,:langue2:->langue2.swf,:triste:->triste2.png,:3points:->3points.png,:ange:->ange.png,:leaveablankpliz:->blank.gif,:leaveablankpliz2:->blank.gif,:sourire:->smile.png,:wink:->oeil.png,:hey:->biggrin.png,:zoid:->zoid.png,:ohgod:->ohmy.png,:what:->mellow.png,:mad:->mad.png,:unsure:->unsure.png,:coeur:->coeur.png,:ouin:->cry.png,:reve:->dream.png,:hory:->eldiablo.png,:chat:->meow.png,:han:->ohh.png,:susp:->susp.png,:na:->tongue.png,:mais:->triste.png,:troll:->UMAD.png,:hw:->citrouille.png,:3:->pussycat.png,:calim:->calim.gif";

/* Bip */
params.soundAlerts                  = true;

params.quitMessage                  = "";

params.showTimeStamp24Hour			= true;

params.timestampFormat 				= "[HH:mm:ss]";

/* See more parameters at http://redmine.lightirc.com/projects/lightirc/wiki/Customization_parameters */




/* Use this method to send a command to lightIRC with JavaScript */
function sendCommand(command) {
  swfobject.getObjectById('lightIRC').sendCommand(command);
}

/* Use this method to send a message to the active chatwindow */
function sendMessageToActiveWindow(message) {
  swfobject.getObjectById('lightIRC').sendMessageToActiveWindow(message);
}

/* Use this method to set a random text input content in the active window */
function setTextInputContent(content) {
  swfobject.getObjectById('lightIRC').setTextInputContent(content);
}

/* This method gets called if you click on a nick in the chat area */
function onChatAreaClick(nick, ident, realname) {
  //alert("onChatAreaClick: "+nick);
}

/* This method gets called if you use the parameter contextMenuExternalEvent */
function onContextMenuSelect(type, nick, ident, realname) {
  alert("onContextMenuSelect: "+nick+" for type "+type);
}

/* This method gets called if you use the parameter loopServerCommands */
function onServerCommand(command) {
  return command;
}

window.onbeforeunload = function() {
  swfobject.getObjectById('lightIRC').sendQuit();
}

/* This loop escapes % signs in parameters. You should not change it */
for(var key in params) {
  params[key] = params[key].toString().replace(/%/g, "%25");
}
