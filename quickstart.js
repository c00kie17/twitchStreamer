var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var https = require('https');
var spawn = require("child_process").spawn;
process.stdin.setEncoding('utf8');

//VALUE VARIABLES
var streamBroadcastId ;
var streamBroadcastChatId;
var streamLivestreamId;
var globalauth;
var streamNextPageToken;
var url = 'https://api.twitch.tv/kraken/streams/';
var donateLink ='https://www.twitchalerts.com/donate/'
var linkurl="https://www.twitch.tv/"
var channels=['epicenter_en2','epicenter_en1','esl_joindotared','dotapit','jimbenofficial','synderen','dotademon','joindotared','ohaiyodota','girlstorule','odpixel','tobiwan','attackerdota','dotamajor','beyondthesummit','beyondthesummit2','beyondthesummit3','dotastarladder_en','dreamleague','dendi','purgegamers','merlinidota','draskyl','barnyyy','wagamamatv','blitzdota','blackdotatv','sing_sing','miracle_doto','bigdaddy','moonmeander','fnaticfly','arteezy','sumaildoto','universedota','feardarkness','ppd','eternalenvyy','w33haa','miserytheslayer','puppey','pieliedie','god_vp','dk_phobos','lil_hardy','abfnggshka','liveandletloda','s4','admiralbulldog','egm','followakke','matumbaman','dota2fata','mindcontrolll','jeraxai','kuroky','empirealwayswannafly','chessie','limmp','melonzz','zfreek','9pasha','sololineabuse','followmag','ditya_ra','generalqw','lightofheaven','sonneiko','artstyle','illidanstrdoto','iceiceice','alohadancetv','funn1k','xboct','resolut1ontv','aui_2000','nooneboss','sheevergaming','zai','SirActionSlacks','bananaslamjamma'];
var names=['','','','','JimBenDoto','syndereN','DeMoN','','Fnatic.Ohaiyo','GirlsToRule','ODPixel','TobiWan','!Attacker','','','','','','','NaVi.Dendi','Purge','Merlini','Draskyl','barnyyy','Wagamama','Blitz','Black^','SingSing','OG.Miracle-','OG.BigDaddyN0tail','OG.MoonMeander','OG.Fly','Secret.Arteezy','EG.SumaiL','Secret.UNiVeRsE','EG.Fear','EG.ppd','Secret.EternaLEnVy','DC.w33','DC.MiSeRy','Secret.Puppey','Secret.pieliedie','VP.G','Polarity.DkPhobos','Polarity.Lil','VP.fng','Alliance.Loda','Alliance.s4','Alliance.AdmiralBulldog','Alliance.EGM','Alliance.Akke','Liquid.MATUMBAMAN','Liquid.FATA-','Liquid.MinD_ContRoL','Liquid.JerAx','Liquid.KuroKy','TSpirit.ALWAYSWANNAFLY','Complexity.Chessie','Complexity.Limmp','Complexity.swindlemelonzz','Complexity.Zfreek','Polarity.9pashaebashu','Vega.Solo','Vega.Mag~','NaVi.Ditya Ra','NaVi.GeneRaL','LighTofHeaveN','NaVi.SoNNeikO','NaVi.Artstyle','TSpirit.Illidan','Ehome.iceiceice','Empire.ALOHADANCE','TSpirit.Funn1k','XOBCT','DC.Resolut1on','EG.Aui_2000','Vega.No[o]ne','Sheever','EG.zai','SirActionSlacks','BananaSlamJamma'];
var voteId=['epi2','epi','ejtr','dp','jbd','sn','dd','jdr','ohi','gtr','od','tw','att','dm','bts','bts2','bts3','star','dl','den','pg','mer','drak','barn','waga','blit','blk','ss','mir','dad','mm','ff','rtz','sum','uni','fear','ppd','ee','w33','mis','pup','pie','god','dk','lil','fng','agod','s4','bull','egm','akke','matu','fata','mc','jer','kuro','awf','chse','limp','melz','frek','pasha','solo','mag','dr','gen','loh','sonn','asty','illi','ice','aloha','fun','xboct','reso','aui','no','she','zai','sas','bsj']; 
var index=0;
var live=[];
var currentlyStreaming;
var showLive=[];
var sendHelp = 0;
var youtubeChannelId;
var votes= [];

//CHECKING VARIABLES
var livestremerspawncheck=0;
var nonefoundspawncheck=0;
var switchingspawncheck=0;
var voteswitch=0;
var populating=0;
var currentTime=0;
var startpop =0;
var exitlistener =0;
var first = 0;
var waitingforstream =0;
var apierror =0;



//=============================================GOOGLE OAUTH 2 CLIENT =======================================================//
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly','https://www.googleapis.com/auth/youtube','https://www.googleapis.com/auth/youtube.force-ssl','https://www.googleapis.com/auth/youtubepartner'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';



// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  authorize(JSON.parse(content),saveAuthValue);
});
  

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
//callback to save the auth value
function saveAuthValue(auth) {
  globalauth = auth;
  getBroadcastDetails();
  checkTime();
  killVlc();
  stdinput();

 }
//=============================================GOOGLE OAUTH 2 CLIENT =======================================================//


//checks for broadcast values and updates them 
function getBroadcastDetails(){
  next =1;
  console.log("getting broadcast details");
  var youtube = google.youtube('v3');
  youtube.liveBroadcasts.list({
    auth:globalauth,
    part:'id,snippet',
    maxResults:1,
    mine:"true"},
    function(err,response){
     if (err) {
        console.log('The API returned an error: ' + err);
        return;
     }
     else{
      //console.log(response);
        itemdata = response.items;
        if(itemdata.length!= 0){
          for(i=0;i<itemdata.length;i++){
            var eachItem = itemdata[i];
           for(key in eachItem){
             if(eachItem.hasOwnProperty(key)) {
                if(key === "id"){
                  streamBroadcastId = eachItem[key];
                  console.log("new broadcast id "+streamBroadcastId);
                }
                if(key === "snippet"){
                  //console.log(key);
                  var value = eachItem[key];
                  streamBroadcastChatId = value.liveChatId;
                  youtubeChannelId = value.channelId;
                  console.log("new chat id "+streamBroadcastChatId);
                }
              }
            }
          }
          //sendMessage();
          populateLive();
        }         
     }
  });

}

//changes the title of the given Braodcast
function changeBroadcastTitle(){
  var value;
  var descrip = "This channel will stream dota 24/7 ,come anytime and find your favorite professional players or games LIVE right here. \n\nHow this channel Works:The channel broadcasts the stream with the highest views on twitch, if it finds another stream with higher views it will switch to that.Once the stream has ended it will search for the next stream automatically,This may take about 2 minutes,so sit tight and wait.This channel will stream Dota 2 ALL THE TIME \nDont forget to Subscribe!\n Thank you for Watching!\n\n F.A.Q \nQ)The stream switched to something else! \nIt did because it found a stream with higher viewers on Twitch\nQ)But...I was watching that!!!\n Im sorry! But until our voting system is in place you will just have to deal with it,if I am watching the stream and see requests for another stream in the comments I will change it\nQ)Why aren't you watching your own stream??\nThis stream runs 24/7 ill try by best to keep track of whats happening but I need to do other human stuff.\nQ)There is a delay.\nYes there is of about 40 seconds from twitch, so that if the twitch stream goes down for a few seconds this stream wont go down too and everything run smoothly.There is about a 2 minute delay from Dota,thats beause I get the stream from twitch and the delay adds up.\nQ)Its Lagging!\nIm sorry.Usually the lag is due the twitch servers not responding properly,there is nothing anyone but twich can do about this,lets all hope it gets fixed soon.\nQ)Blackout!WTF!\nthere are 3 reasons for this:\n1)the stream is switching wait 10 seconds the new stream will start.\n2)I restarted the system,the stream will be back in 2 minutes.\n3)The server crashed!when I get access to the server I will restart it.\nTHANK YOU"
  if(currentlyStreaming.name === ''){
    value = currentlyStreaming.desc;
  }
  else{
    value = currentlyStreaming.name;
  }
  //console.log(value);
  var youtube = google.youtube('v3');
  youtube.liveBroadcasts.update({
    auth:globalauth,
    part:'snippet',
    resource:{
      id:streamBroadcastId,
      snippet:{
        scheduledEndTime:"1970-01-01T00:00:00.000Z",
        scheduledStartTime:"2016-03-19T10:30:00.000Z",
        title:"[24/7] Dota | "+value,
        description: descrip
      }
    }
  },
  function(err,response){
    //console.log(response);
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    else{
      console.log("name changed to "+value)
      //console.log(response);
    }
  });
}


//populates the live array
function populateLive(){
  //stop the recusive apps 
  index = 0;
  live = [];
  populating=1;
  insidePopulate();
  function insidePopulate(){
    if(index < channels.length){
      //console.log("again");
      https.get(url+channels[index], function(res){
                        
          var body = '';

          res.on('data', function(chunk){
            //console.log(chunk);
              body += chunk;
          });

          res.on('error', function(err) {
              console.log(err);
          });

          res.on('end',function(){
            if(res.statusCode === 503 ){
                console.log("error occoured trying again main");
                insidePopulate();
            }
            else{
                
                var response = JSON.parse(body);
               // console.log(response);
                console.log(index+ `  checking ` + channels[index]);
                if(response.stream !== null&&response.stream.game ==='Dota 2'){
                  live.push({
                      name:names[index],
                      urldata:channels[index],
                      desc:response.stream.channel.status,
                      lang:response.stream.channel.language,
                      viewers :response.stream.viewers,
                      link:linkurl+channels[index],
                      donate:donateLink+channels[index],
                      vote:voteId[index]
                  });
                  console.log("^^^^^^^^^^^^^^stream added^^^^^^^^^^^^^^");
                }
                index++;
                insidePopulate();
            }
          });
      });
    }
    else{
      if(live[0]===undefined){
        noneFound();
        populateLive();
      }
      else{
        live.sort(function(a, b){
          return b.viewers-a.viewers;
        });
        console.log(live);
        showLive = live;
        checkForDead();
        if(voteswitch === 0){
          if(currentlyStreaming === undefined){
            lauchStream(live[0]);
            //make voteswitch 1;
          }
          else{
            if(currentlyStreaming.urldata!=live[0].urldata || livestremerspawncheck === 0){
              lauchStream(live[0]);
            }
            if(currentlyStreaming.urldata === live[0].urldata){
              if(apierror === 1){
                lauchStream(live[0]);
                apierror=0;
              }
            }
          }  
        }
        if(first === 0){
          first=1;
          recurse();
        }
        populating =0;
      }
    } 
  }           
}



//lauches the passed stream
function lauchStream(currentStream){
  waitingforstream = 1;
 // console.log("in lauch stream");
  currentlyStreaming = currentStream
  if(livestremerspawncheck === 1){
    if(livestreamer!=undefined){
      console.log("main process killed");
                spawn("taskkill", ["/pid", livestreamer.pid, '/f', '/t']);
                livestremerspawncheck = 0;
    }
    else{
      console.log("livestreamer already closed");
    }
  }
  if(switchingspawncheck === 1){
    if(switching!=undefined){
      console.log("switching process killed");
                spawn("taskkill", ["/pid", switching.pid, '/f', '/t']);
                switchingspawncheck = 0;
    }
    else{
      console.log("switcher already closed");
    }
  }
  if(nonefoundspawncheck === 1){
    if(nonefound!=undefined){
      console.log("none process killed");
                spawn("taskkill", ["/pid", nonefound.pid, '/f', '/t']);
                nonefoundspawncheck = 0;
    }
    else{
      console.log("nonefound already closed");
    }
  }
  if(livestremerspawncheck === 0){
    var streamurl = 'http://www.twitch.tv/'+currentlyStreaming.urldata;
    livestreamer = spawn('livestreamer', [streamurl, 'source']);
                livestreamer.on('error', function(err) {
                    console.log(err);
                });
            checkIfStreamOpen();    
            livestreamer.setMaxListeners(Infinity);
            console.log("_________________________________________STARTED STREAMING MAIN____________________________________________");
            livestremerspawncheck=1; 
            console.log("streaming:" + currentlyStreaming.urldata);
            messageSort("!streaming");
            var sponser ="Hey guys,if you liked the stream please head over to the streamers twitch channel and follow or subscribe.Click on the donate link to support them.Without them this channel wouldnt be possible. "
            sendMessage(sponser);
  } 
  setTimeout(function(){
      waitingforstream =0;
      var letItBegin = "Voting Session has Started";
      sendMessage(letItBegin);
    },15000)
  changeBroadcastTitle();
}

//gets the initial token to fill the tokenParamater
function getNextToken(){
  //console.log("in get new token");
  var youtube = google.youtube('v3');
  youtube.liveChatMessages.list({
  auth:globalauth,
  liveChatId:streamBroadcastChatId,
  part:"id,snippet,authorDetails",
  maxResults:"2000"
  },
  function(err,response){
    if (err) {
    console.log('The API returned an error: ' + err);
    return;
    }
    else{
      streamNextPageToken = response.nextPageToken;
      console.log("initial token "+ streamNextPageToken);
    }
  });
}


//keeps checking for new messages
function checkingmesseges(){
  //console.log("checking Messages");
  var itemdata =[];
  var youtube = google.youtube('v3');
  youtube.liveChatMessages.list({
    auth:globalauth,
    liveChatId:streamBroadcastChatId,
    part:"id,snippet,authorDetails",
    maxResults:"2000",
    pageToken:streamNextPageToken      
  },
  function(err,response){
  if (err) {
  console.log('The API returned an error: ' + err);
  return;
  }
  else{
    //console.log(response);
    streamNextPageToken = response.nextPageToken;
    //console.log(streamNextPageToken);
    itemdata = response.items;
    if(itemdata.length!= 0){
      for(i=0;i<itemdata.length;i++){
        var eachItem = itemdata[i];
       for(key in eachItem){
           if(eachItem.hasOwnProperty(key)) {
              if(key === "snippet"){
                var value = eachItem[key];
                var singleMessage = value.textMessageDetails.messageText;
              }
              if(key === "authorDetails"){
                var value = eachItem[key];
                var messageSender = value.displayName;
              }
              messageSort(singleMessage,messageSender);
          }
        }
      }
    }
  }

  });

}
  

// runs when populates finds nothing
function noneFound(){
  console.log("none found! Searching again....");
    if(livestremerspawncheck === 1){
      if(livestreamer!=undefined){
        console.log("main process killed");
        spawn("taskkill", ["/pid", livestreamer.pid, '/f', '/t']);
        livestremerspawncheck = 0;
      }
      else{
        console.log("livestreamer already closed");
      }
    }
    if(switchingspawncheck === 1){
      if(switching!=undefined){
        console.log("switching process killed");
        spawn("taskkill", ["/pid", switching.pid, '/f', '/t']);
        switchingspawncheck = 0;
      }
      else{
        console.log("switcher already closed");
      }
    }
    if(nonefoundspawncheck === 0){
      nonefoundspawncheck=1;
        nonefound = spawn('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe', ['--loop','--fullscreen' ,'C:\\Users\\anshu\\Desktop\\you\\notfound.mp4']); 
        nonefound.on('error', function(err) {
           console.log(err);
        });
    }
   populateLive(); 
}

//keeps looping to check chat messeges and stream status
function recurse(){
  //console.log("recurse started");
  var time=0;
  recurseTrue=0;
  getNextToken();
  function anotherOne(){
    //console.log("in another one");
    if(time === 85){
      time =0;
      if(populating === 0){
       populateLive();
      }
    }
    else{
    time++;
    concurrentViewers();
    checkingmesseges();
    if(populating === 0){
      streamStatus();
    }
    var value = 85 - time;
    console.log("checks to populate "+ value);
    }
    setTimeout(function(){
    //console.log("in timeout");
     anotherOne();
    },3500)
  }
  setTimeout(function(){
    //console.log("in timeout");
     anotherOne();
    },3500)

}

//checks if the currently streaming stream is still live
function streamStatus(){
  //console.log("checking stream status");
  https.get(url+currentlyStreaming.urldata, function(res){
                    
      var body = '';

      res.on('data', function(chunk){
          body += chunk;
      });

      res.on('error', function(err) {
          console.log(err);
      });

      res.on('end',function(){
        if(res.statusCode === 503 ){
           console.log("error occoured trying again main");
           streamStatus();
        }
        var response = JSON.parse(body);
         //console.log(response);
        if(response.stream === null){
          voteswitch=0;
          switchingStream();
          populateLive();
          apierror =1;
        }
        else{
          if(response.stream.game !='Dota 2'){
            switchingStream();
            populateLive();
          }
          var tempStreaming = currentlyStreaming;
          currentlyStreaming.desc = response.stream.channel.status;
          if(tempStreaming.desc!= currentlyStreaming.desc){
            changeBroadcastTitle();
          }
          //checkIfStreamOpen();
        }
      });  
  });      

}




//switches the steam to switching stream status
function switchingStream(){
  if(livestremerspawncheck === 1){
    if(livestreamer!=undefined){
      console.log("main process killed");
      spawn("taskkill", ["/pid", livestreamer.pid, '/f', '/t']);
      livestremerspawncheck = 0;
    }         
    else{
      console.log("livestreamer already closed");
    }
  }
  if(nonefoundspawncheck === 1){
    if(nonefound!=undefined){
      console.log("main process killed");
          spawn("taskkill", ["/pid", nonefound.pid, '/f', '/t']);
          nonefoundspawncheck = 0;
    }
    else{
      console.log("nonefound already closed");
    }
  }
  if(switchingspawncheck === 0){
    switching = spawn('C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe', ['--loop','--fullscreen', 'C:\\Users\\anshu\\Desktop\\you\\switch.mp4']); 
    switching.on('error', function(err) {
       console.log(err);
    });
    switchingspawncheck=1; 
  }
}


//checks if the stream has crashed unexpectdly and restarts it 
function checkIfStreamOpen(){
  //console.log("checking if stream is open");
  //console.log(livestreamer);
  livestreamer.on('exit',function() {
    //waitingforstream is used to only check the listener after the stream has started so that it does not spawn another stream
    if(waitingforstream === 0){
      if(livestremerspawncheck === 1){
        
      
        if(exitlistener === 0){
          exitlistener =1;
          if(nonefoundspawncheck === 1){
            if(nonefound!=undefined){
              console.log("main process killed");
                      spawn("taskkill", ["/pid", nonefound.pid, '/f', '/t']);
                      nonefoundspawncheck = 0;
            }
            else{
              console.log("nonefound already closed");
            }
          }
          if(switchingspawncheck === 1){
              if(switching!=undefined){
                console.log("switching process killed");
                    spawn("taskkill", ["/pid", switching.pid, '/f', '/t']);
                    switchingspawncheck = 0;
              }
              else{
                console.log("switcher already closed");
              }
          }
            console.log("restaring stream");
            var streamurl = 'http://www.twitch.tv/'+currentlyStreaming.urldata;
            livestreamer = spawn('livestreamer', [streamurl, 'source']);
                livestreamer.on('error', function(err) {
                    console.log(err);
                });
                checkIfStreamOpen();
                livestreamer.setMaxListeners(Infinity);
                console.log("streaming:" + currentlyStreaming.urldata);
                console.log("_________________________________________STARTED STREAMING RESTART____________________________________________");
                livestremerspawncheck =1;
        }
      }
    }  
  });
  livestreamer.on('close', function() {
   exitlistener=0;
  });
}


//keeps tracks of the time the application has been alive 
function checkTime(){
  setInterval(function(){
    currentTime++;
    sendHelp++
    if(sendHelp ===0){
      sendMessage("You can now use these commands to Interact with the chat:\n");
      messageSort("!help");
      sendHelp = 0;
    }
    console.log("                                                                  Seconds: " + currentTime);
  },1000)
}


//sorts the messages and finds out if they are valid or not
function messageSort(message,sender){
  if(message === "!about"){
    var aboutUs = "This channel will stream dota 24/7 ,for more information on how the channel works read the description.\nThank you for watching.\nDont forget to Subscribe";
    sendMessage(aboutUs);
    //console.log(aboutUs)   
  }
  if(message === "!help"){
    var help = "!about - to know about this channel \n!help - all the usable commands \n!live - gives you a list of currently live channels \n!streaming - gives you deatils about the currently streaming channel\n!votehelp - how to vote and rules of voting ";
    sendMessage(help);
    //console.log(help);
  }
  if(message === "!votehelp"){
    var voteHelp = "you can vote by using !+voteid of the desired streamer.You can only vote once for one streamer, during a vote session.Mutiple votes will not be counted.";
    sendMessage(voteHelp);
    //console.log(voteHelp);
  }
  if(message === "!live"){
    if(showLive[0] === undefined ){
      var nonelive= "no channels currenly live"
      sendMessage(nonelive);
      //console.log(nonelive);
    }
    else{
      var response = "Currently Live";
      for(var i=0;i<showLive.length;i++){
        if(showLive[i] != currentlyStreaming){
          response += "\n";
          if(showLive[i].name === ''){
            response += showLive[i].desc;
          }
          else{
            response += showLive[i].name;
          }
          response+= " (";
          response+=showLive[i].lang;
          response+=")"
          response +="\n";
          response+="voteid: "
          response+=showLive[i].vote;
          response+="\n"

        }
        response.toString();
        sendMessage(response);
        //console.log(response);
      }  
    }

  }
  if(message === "!streaming"){
    if(currentlyStreaming === undefined ){
      var response = "No channel is currently Streaming";
      sendMessage(response);
      console.log(response);
    }
    else{
      var response = "Streaming";
      response+="\n"
      response +="Name: "
      if(currentlyStreaming.name === ''){
        response += currentlyStreaming.desc;
      }
      else{
        response += currentlyStreaming.name;
      }
      response+=" ("
      response += currentlyStreaming.lang;
      response+=")"
      response+="\n";
      response+="Link: "
      response+= currentlyStreaming.link;
      response+="\n";
      response+="Donate:"
      response+=currentlyStreaming.donate;
      response.toString();
      sendMessage(response);
      //console.log(response);
    }  
  }
  for(var i=0;i<showLive.length;i++){
    if(message === "!"+showLive[i].vote){
      addVote(showLive[i].vote,sender,showLive[i].name);
    }
  }
}

//adds the vote obtined by the sender
function addVote(vote,sender,name){
  if(currentWatching < 15){
    var notEnough="Need more than 15 viewers to start voting.Share the stream and invite more people https://www.youtube.com/watch?v="+streamBroadcastId;
    sendMessage(notEnough);
    //console.log(notEnough);
  }
  else{
    if(vote === currentlyStreaming.vote){
      var cantVote = "cant vote for the currently streaming stream"
      sendMessage(cantVote);
      //console.log(cantVote);
    }
    else{
      if(waitingforstream === 0){
        var flag =0;
        for(var i=0;i<votes.length;i++){
          if(votes[i].voter === sender){
            flag=1;
          }
        }
        if(flag === 0){
          votes.push({
            stream:vote,
            voter:sender,
            checking:0
          });
        }
        var currentVotes=0;
        for(var i=0;i<votes.length;i++){
          if(votes.stream === vote){
            currentVotes++;
          }
        }
        if(currentVotes>=percentValue){
          winnerStream(name);
          waitingforstream =1;
        }
        else{
          var response;
          response+=sender;
          response+=" voted for -> "
          response+=name;
          response+="\n"
          var percentValue = Math.round(currentWatching*0.4)
          var needed = percentValue - currentVotes;
          response+="need "
          response+=needed
          response+=" more"
          response.toString();
          sendMessage(response);
          //console.log(response);
        }
      }
      else{
        var plzWait = "Please Wait.. Let the Stream is Begin"
        sendMessage(plzWait);
        //console.log(plzWait);
        votes=[];
      }
    }    
  }
}

//sets the winner and restarts the stream to the winner
function winnerStream(name){
  votes=[];
  var value;
  for(var i=0;i<showLive.length;i++){
    if(name === showLive[i].name){
      value=showLive[i];
    }
  }
 https.get(url+value.urldata, function(res){
                  
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('error', function(err) {
        console.log(err);
    });

    res.on('end',function(){
      if(res.statusCode === 503 ){
         console.log("error occoured trying again main");
         winnerStream(name);
      }
      var response = JSON.parse(body);
         //console.log(response);
        if(response.stream === null){
         var message = "the stream selected to launch is now offline";
         sendMessage(message);
         //console.log(message);
         waitingforstream = 0;
         var letItBegin = "Voting Session has Started";
         sendMessage(letItBegin);
         //console.log(letItBegin);
        }
        else{
         lauchStream(value);
        }

    });  
 });   
}

//checks the number of viewers currently watching
function concurrentViewers(){
  var youtube = google.youtube('v3');
  youtube.videos.list({
    auth:globalauth,
    part:"snippet,liveStreamingDetails",
    id:streamBroadcastId,
    maxResults:1},
  function(err,response){
    if (err) {
        console.log('The API returned an error: ' + err);
        return;
     }
     else{
      //console.log(response);
      var itemdata = response.items;
      if(itemdata.length!= 0){
        for(i=0;i<itemdata.length;i++){
          var eachItem = itemdata[i];
         for(key in eachItem){
           if(eachItem.hasOwnProperty(key)) {
              if(key === "liveStreamingDetails"){
                var value = eachItem[key];
                currentWatching = value.concurrentViewers;
                if(currentWatching === undefined){
                  currentWatching = 0;
                }
                console.log("                                                                  number of people watching: "+currentWatching );
              }
              
            }
          }
        }
      }
    }
  });
}

//removes all values of dead stream from votes
function  checkForDead(){
  for(var i=0;i<showLive.length;i++){
    for(var j=0;j<votes.length;j++){
      if(showLive[i].vote === votes[j].stream){
        votes[j].checking = 1;
      }
    }
  }
  for(var i=0;i<votes.length;i++){
    if(votes[i].chekcing === 0){
      vote.splice(i,1);
    }
  }
  for(var i=0;i<votes.length;i++){
    votes[i].chekcing =0;
  }


}


//kills all instances of vlc
function killVlc(){
    var killvlc = spawn('taskkill', ['/F','/IM', 'vlc.exe']);
                killvlc.on('error', function(err) {
                    console.log(err);
                });
}


//checks for standard input and performs task 
function stdinput(){
  process.stdin.on('data', function (text) {
    if(text === 'live\n'){
      if(showLive[0] === undefined){
        console.log("wait bitch");
      }
      else{
        var response="ONLINE: \n";
        for(var i=0; i<showLive.length;i++){
          if(showLive[i].name === ''){
            response+= showLive[i].desc;
          }
          else{
            response +=showLive[i].name;
          }
          response+="\nid: "  
          response += showLive[i].vote;
          response+="\n"
          response+="-----------------------"
          response+= "\n"
        }
        console.log(response);
      }  
    }
    //console.log(text);
    for(var i=0;i<showLive.length;i++){
      if(text === showLive[i].vote +"\n"){
        lauchStream(showLive[i]);
        voteswitch =1;
      }
    }
  });
}


//sends a message to the current Broadcast
function sendMessage(value){
  //console.log("sending Message: "+ value);
  var youtube = google.youtube('v3');
  youtube.liveChatMessages.insert({
    auth:globalauth,
    part:'snippet',
    resouce:{
      snippet:{
        textMessageDetails:{
          messageText:value
        },
        type:"textMessageEvent",
        liveChatId:streamBroadcastChatId
      },
      authorDetails:{
        displayName:"Dotabot"
      }
    }
  },
  function(err,response){
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    else{
      console.log(response);
    }
  });

}