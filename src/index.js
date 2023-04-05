import * as THREE from 'three';
import ballUrl from '../public/ball-uv.png';
import floorURl from '../public/piso1.jpg';
import field1Url from '../public/pitch.png';
import stadiumUrl from '../public/stadium351.png';
import stadiumUrl_IPL from '../public/statdium_ipl2.png';
import trajectoryBall1 from '../public/test.json';
import trajectoryBall2 from '../public/demo1.json';
import trajectoryBall3 from '../public/demo1.json';
import trajectoryBall4 from '../public/demo1.json';
import trajectoryBall5 from '../public/demo1.json';
import trajectoryBall6 from '../public/demo1.json';
// import bowlerUrl from '../public/bowler.png';
// import stumpsUrl from '../public/stumps.png';
// import slipUrl from '../public/slip.png';
import wicketsUrl from '../public/adWickets.png';
import wicketsUrl_IPL from '../public/adWickets_ipl2.png';
import gsap from 'gsap';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import './index.css';

const isMobile = window.innerWidth<500?true:false;
let mParam = new URLSearchParams(window.location.search);
if(mParam.get('ipl')!=null){
    document.querySelector('.container').classList.add("iplClass");
}

let bowlerCoords = [10.3, 2.2, 0]; 
let slipCoords = [-13.3, 1.5, 2]; 
const stumpsCoords = [-16, 3.5, 0]; 

if(isMobile){
    slipCoords = [-14.5, 1.2, 0.2];
    bowlerCoords = [13.7, 2.2, 0]; 
}

function getControlPoint (p1, p2) {
    return (1-.5) * p1 + (.5) * p2;
}

const textureLoader = new THREE.TextureLoader();
let ballsTogether = false;
let balls = [];
let indexBall = 0;
const velocity = 9;

function createTrajectory (data, ballMesh, ballsTogether) {
    const trajectoryData = data.match.delivery.trajectory; 
    
    // the line bellow has a ball size twice bigger for visual propposes 
    const sphereGeometry = new THREE.SphereGeometry(0.071, 40, 20);

    // the size of the ball is 7.1 cm in diameter 
    // SphereGeometry first parameter specifies the radius 
    // the line bellow has the exact ball size 
    // const sphereGeometry = new THREE.SphereGeometry(0.036, 40, 20);
    // in case you change the ball size, you may need to adjust the line behind the ball
    // change it in line 112 "lineWidth"
    const imgBall = textureLoader.load(ballUrl);
    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: imgBall, playTheseBalls
    }); 
    ballMesh.ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
    ballMesh.ball.visible = ballsTogether;
    ballMesh.ball.name = 'ball';
    scene.add(ballMesh.ball);
    //better use stumpPosition
    const releasePosition = trajectoryData.releasePosition;
    const bouncePosition = trajectoryData.bouncePosition;
    const creasePosition = trajectoryData.stumpPosition;
    
    let myX = -10.06 + bouncePosition.x;
    if(bouncePosition.x < 0){
        myX = -(10.06 + bouncePosition.x); 
    }

    let myYBounce = bouncePosition.y * -1;
    bouncePosition.y = myYBounce;

    let myYstump = creasePosition.y * -1;
    creasePosition.y = myYstump;

    let myYRelease = releasePosition.y * -1;
    releasePosition.y = myYRelease;

    bouncePosition.x = myX ;
    //const creasePosition = trajectoryData.creasePosition; 
    const vecRelease = new THREE.Vector3(releasePosition.x, releasePosition.z, releasePosition.y);
    const vecBounce = new THREE.Vector3(bouncePosition.x , bouncePosition.z, bouncePosition.y);
    
    const vecCrease = new THREE.Vector3(creasePosition.x, creasePosition.z, creasePosition.y);
    const distanceCurve1 = vecRelease.distanceTo(vecBounce);
    const distanceCurve2 = vecBounce.distanceTo(vecCrease);
    const curve = new THREE.QuadraticBezierCurve3(
        vecRelease,
        new THREE.Vector3(getControlPoint(releasePosition.x, bouncePosition.x), releasePosition.z, getControlPoint(releasePosition.y, bouncePosition.y)),
        vecBounce,
    );
    const numberPoints1 = Math.round(distanceCurve1 * velocity);
    const points = curve.getPoints( numberPoints1 );
    const curve2 = new THREE.QuadraticBezierCurve3(
        vecBounce,
        new THREE.Vector3(getControlPoint(bouncePosition.x, creasePosition.x), creasePosition.z, getControlPoint(bouncePosition.y, creasePosition.y)),
        vecCrease
    );
    const numberPoints2 = Math.round(distanceCurve2 * velocity);
    const points2 = curve2.getPoints( numberPoints2 );
    const directions = [...points, ...points2];
    const pointsLines = [];
    

    directions.map((element) => {
        pointsLines.push([element.x, element.y, element.z]);
    });
    const geometry = new MeshLine();
    geometry.setPoints(pointsLines.flat());
    const materialLine = new MeshLineMaterial({
        color: ballMesh.colorLine,
        lineWidth: 0.1,
        transparent: true,
        opacity: 0.5,
    });
    geometry.setDrawRange(0, 0);
    ballMesh.line = new THREE.Mesh(geometry, materialLine);
    ballMesh.line.name = 'line';
    ballMesh.line.geometry.attributes.position.needsUpdate = true;
    scene.add(ballMesh.line);
    ballMesh.directions = directions;
    ballMesh.render = true;
}


// function playTheseBalls (ballsTogetherBoolean, data1, data2, data3, data4, data5, data6) {

window.playTheseBalls = async function (ballsTogetherBoolean, data1, data2, data3, data4, data5, data6) {
    //resetAnimation();
    window.resetA();
    ballsTogether = ballsTogetherBoolean;
    if (data1) {
        let myText = (data1.match.delivery.deliveryNumber.over - 1)+'.'+data1.match.delivery.deliveryNumber.ball+' '+(data1.match.bowlingTeam.bowler.name.toLowerCase())+' to '+(data1.match.battingTeam.batsman.name.toLowerCase())+', '+((data1.match.delivery.trajectory.releaseSpeed * 1.60934).toFixed(1))+' km/h, '+((data1.match.delivery.scoringInformation.wicket.isWicket)?'wicket':data1.match.delivery.scoringInformation.score+' run');
        textBallInfo.innerHTML = myText;
       trajectoryBall1 = data1;//await import("../public/"+data1+".json");
       balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xff0000});
       createTrajectory(trajectoryBall1, balls[0], ballsTogetherBoolean);
    };
    if (data2) {
        trajectoryBall2 = data2;//await import("../public/"+data2+".json");
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0x2def33});
        createTrajectory(trajectoryBall2, balls[1], ballsTogetherBoolean);
    };
    if (data3) {
        trajectoryBall3 = data3;//await import("../public/"+data3+".json");
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xffe604});
        createTrajectory(trajectoryBall3, balls[2], ballsTogetherBoolean);
    };
    if (data4) {
        trajectoryBall4 = data4;//await import("../public/"+data3+".json");
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0x2018ff});
        createTrajectory(trajectoryBall4, balls[3], ballsTogetherBoolean);
    };
    if (data5) {
        trajectoryBall5 = data5;//await import("../public/"+data3+".json");
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xff7c18});
        createTrajectory(trajectoryBall5, balls[4], ballsTogetherBoolean);
    };
    if (data6) {
        trajectoryBall6 = data6;//await import("../public/"+data3+".json");
        balls.push({ball: null, line: null, animation: 0, countDrawn: 0, directions: [], render: false, colorLine: 0xff186d});
        createTrajectory(trajectoryBall6, balls[5], ballsTogetherBoolean);
    };
}

const container = document.querySelector('.three-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA3A3A3);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1.1, 100);


camera.position.x = bowlerCoords[0];
camera.position.y = bowlerCoords[1];
camera.position.z = bowlerCoords[2];

camera.lookAt(new THREE.Vector3(0, -2, 0));


const renderer = new THREE.WebGL1Renderer({
    antialias: true
});

renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, !isMobile?(window.innerHeight-160):(window.innerHeight-220));
container.appendChild(renderer.domElement);


function resetAnimation () {
    if (ballsTogether) {
        for (let i = 0; i < 10; i++) {
            if(balls[i]) { 
                balls[i].animation = 0;
                balls[i].countDrawn = 0;
            }
        };
    } else {
        for (let i = 0; i < 10; i++) {
            if(balls[i]) { 
                balls[i].animation = 0;
                balls[i].countDrawn = 0;
                balls[i].line.visible = false;
                balls[i].ball.visible = false;
            }
        }
    }
    indexBall = 0;
}

window.resetA = function() {
    balls = [];
    indexBall = 0;
    for(let i = scene.children.length - 1; i >= 0; i--) {
        let object = scene.children[i];
        if (object.name === 'ball' || object.name === 'line') {
            scene.remove(object);
        }
    }
}
    


const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

let xField = 33;
let zField = -50;

for (let i = 1; i < 26; i++) {
    const floorImg = textureLoader.load(floorURl);
    const planeGeometry = new THREE.PlaneGeometry(17, 17);
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        map: floorImg
    });
    const floor = new THREE.Mesh(planeGeometry, planeMaterial);
    floor.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), THREE.MathUtils.degToRad(90) );
    floor.position.set(xField, -.1, zField);
    scene.add(floor);
    xField -= 17;
    if (i % 4 === 0) {
        zField += 17;
        xField = 33;
    }
}

const fieldImg = textureLoader.load(field1Url);
const fieldGeometry = new THREE.PlaneGeometry(22.30, 4.5);
const fieldMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true,
    map: fieldImg
});
const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
field.position.set(0, -0.06, 0);
field.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), THREE.MathUtils.degToRad(90) );
scene.add(field);


const backImg = textureLoader.load(mParam.get('ipl')==null?stadiumUrl:stadiumUrl_IPL);
const backGeometry = new THREE.PlaneGeometry(180, 20);
const backMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    map: backImg
});
const backStadio = new THREE.Mesh(backGeometry, backMaterial);
backStadio.rotateOnAxis( new THREE.Vector3( 0, 1, 0  ), THREE.MathUtils.degToRad(270) );
backStadio.position.set(45, 9, 0);
scene.add(backStadio);

const backStadio2 = new THREE.Mesh(backGeometry, backMaterial);
backStadio2.rotateOnAxis( new THREE.Vector3( 0, 1, 0  ), THREE.MathUtils.degToRad(90) );
backStadio2.position.set(-45, 8.5, 0);
scene.add(backStadio2);


const geometria = new THREE.SphereGeometry( 0.085, 32, 16 );
const materialBola = new THREE.MeshBasicMaterial( { color: 0x0000FF, side: THREE.DoubleSide } );
const bola = new THREE.Mesh( geometria, materialBola );
bola.position.set(-10.06, 0.58, -0.8); 
//scene.add(bola);



const wicketsImg = textureLoader.load(mParam.get('ipl')==null?wicketsUrl:wicketsUrl_IPL);
const wicketsGeometry = new THREE.PlaneGeometry(0.22, 0.72);
const wicketsMaterial = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    map: wicketsImg
});

const wickets = new THREE.Mesh(wicketsGeometry, wicketsMaterial); 
wickets.rotateOnAxis( new THREE.Vector3( 0, 1, 0  ), THREE.MathUtils.degToRad(270) ); 
wickets.rotateOnAxis( new THREE.Vector3( 1, 0, 0  ), THREE.MathUtils.degToRad(-12) ); 
wickets.position.set(-9.9, 0.3, 0); 
scene.add(wickets); 

const wickets2 = new THREE.Mesh(wicketsGeometry, wicketsMaterial);
wickets2.rotateOnAxis( new THREE.Vector3( 0, 1, 0  ), THREE.MathUtils.degToRad(90) );
wickets2.position.set(10.03, 0.3, 0);
scene.add(wickets2);


var geo = new THREE.PlaneBufferGeometry(20, 0.2);
var mat = new THREE.MeshBasicMaterial({ color: 0x9999ff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
var plane = new THREE.Mesh(geo, mat);
plane.rotateX( - Math.PI / 2);
scene.add(plane);
plane.position.set(0, -0.05, 0);


const containerReset = document.querySelector('.restart-filter');
containerReset.addEventListener('click', resetAnimation);

// const containerViews = document.querySelector('.views-container');
// const viewButton = document.querySelector('.container-view');
// let isViews = false;
// const divViews = document.createElement('div');
// divViews.className = 'views';
// const divBowler = document.createElement('div');
// divBowler.className = 'bowler-view';
// const imgBowler = document.createElement('img');
// imgBowler.className = 'view-image';
// imgBowler.src = bowlerUrl;
// divBowler.appendChild(imgBowler);
// const divSlip = document.createElement('div');
// divSlip.className = 'slip-view';
// const imgSlip = document.createElement('img');
// imgSlip.className = 'view-image';
// imgSlip.src = slipUrl;
// divSlip.appendChild(imgSlip);
// const divStupm = document.createElement('div');
// divStupm.className = 'stumps-view';
// const imgStumps = document.createElement('img');
// imgStumps.className = 'view-image';
// imgStumps.src = stumpsUrl;
// divStupm.appendChild(imgStumps);

// divViews.appendChild(divBowler);
// divViews.appendChild(divSlip);
// divViews.appendChild(divStupm);

// viewButton.addEventListener('click', () => {
//     isViews = !isViews;
//     if (isViews) {
//         containerViews.appendChild(divViews);
//     } else {
//         containerViews.removeChild(divViews);
//     }
// });


window.setView = function (viewSet) {
    if(viewSet == "bowler") {
        gsap.to(camera.position, {
            x: bowlerCoords[0], 
            y: bowlerCoords[1], 
            z: bowlerCoords[2],
            ease: 'power3.inOut',
            duration: 2,
            onUpdate: () => {
                camera.lookAt(new THREE.Vector3(0, -2, 0))
            },
        });
    } else if(viewSet == "slip") {
        gsap.to(camera.position, {
            x: slipCoords[0], 
            y: slipCoords[1], 
            z: slipCoords[2],
            duration: 2,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.lookAt(new THREE.Vector3(0, -2, 0))
            }
        });
    } else if(viewSet == "stumps") {
        gsap.to(camera.position, {
            x: stumpsCoords[0], 
            y: stumpsCoords[1],
            z: stumpsCoords[2],
            duration: 2,
            ease: 'power3.inOut',
            onUpdate: () => {
                camera.lookAt(new THREE.Vector3(0, -2, 0));

            }
        });
    }
}

function animateBall (ball) {
    if (ball.animation < ball.directions.length) {
        const position = ball.directions[ball.animation];
        ball.ball.position.x = position.x;
        ball.ball.position.y = position.y;
        ball.ball.position.z = position.z;
        ball.line.geometry.setDrawRange( 0, ball.countDrawn  );
        const countDrawn = ball.countDrawn + 6;
        ball.countDrawn = countDrawn;
        const animation = ball.animation + 1;
        ball.animation = animation;
    }
}


function animate() {
    if (ballsTogether) {
        if (balls[0]) {
            animateBall(balls[0]);
        };
        if (balls[1]) {
            animateBall(balls[1]);
        };
        if (balls[2]) {
            animateBall(balls[2]);
        };
        if (balls[3]) {
            animateBall(balls[3]);
        };
        if (balls[4]) {
            animateBall(balls[4]);
        };
        if (balls[5]) {
            animateBall(balls[5]);
        };
    } else {
        if (balls[indexBall]) {
            balls[indexBall].ball.visible = true;
            balls[indexBall].line.visible = true;
            animateBall(balls[indexBall]);
            if (balls[indexBall].animation === balls[indexBall].directions.length - 1) {
                indexBall++;
            };
        }
    };

    renderer.render(scene, camera);
}

setTimeout(function(){
    renderer.setAnimationLoop(animate);
},200)


//setView("bowler");
//playTheseBalls(false, "test"); 



//code by Ranveer for next changes
var APP_URL = 'https://polls.iplt20.com/widget/welcome/get_data?path=';
//var APP_URL = 'http://localhost/widget_entity/welcome/get_data?path=';
let mToken = 'e9a8cd857f01e5f88127787d3931b63a';
var innings = [];
var CurrentBallD = {};
var IningData = [];
IningData[0] = {};

function setAllFilters(eid,matchId){
    let url = "https://rest.entitysport.com/v2/matches/"+eid+"/innings/info?token="+mToken;
    let api_request = httpGetAsyncEntity(url);
        if(api_request.status == 'ok'){
            innings = api_request.response.innings;
			let inning_number = api_request.response.innings[0].number;
			let url2 = "https://rest.entitysport.com/v2/matches/"+eid+"/innings/"+inning_number+"/commentary?token="+mToken+"&actualball=1";
			let api_request2 = httpGetAsyncEntity(url2);
                if(api_request2.status == 'ok'){
                    IningData[0] = api_request2.response;
                    restFilters();
                    document.querySelector('#styleHide').removeAttribute('style');
                    setTimeout(function(){
                        document.querySelector('#coverScreen').remove();
                    },400)
                    
                    for(var i in innings){
                        if(i!=0){
                            let url5 = "https://rest.entitysport.com/v2/matches/"+eid+"/innings/"+innings[i].number+"/commentary?token="+mToken+"&actualball=1";
                            let api_request3 = httpGetAsyncEntity(url5);
                            IningData[i] = api_request3.response;
                        }
                    }
                }
        }
}
window.changeView = function (e,view){
    var rl = document.querySelectorAll('.anglechange.active');
    if(!e.classList.contains('active')){
        e.classList.add('active');
        rl[0].classList.remove('active');
    }
    setView(view);
};
var our_matchID = mParam.get('entity_matchId');
var matchId = mParam.get('matchId');
var baseDire = 'https://post-feeds.s3.ap-south-1.amazonaws.com/';
let myinnings = document.querySelector('.myinnings');
let mybowler = document.querySelector('.mybowler');
let mybatsman = document.querySelector('.mybatsman');
let myover = document.querySelector('.myover');
let myballs = document.querySelector('.myballs');
let mywickets = document.querySelector('.mywickets');
var textBallInfo = document.querySelector('.textBallInfo');
myinnings.addEventListener('change', function () {
    let currInn = {};
    let currInnover = 0;
    
    for(var i in IningData){
        if(this.value == IningData[i].inning.number){
            currInn = IningData[i];
        }
    }
    for(var i in innings){
        if(this.value == innings[i].number){
            currInnover = innings[i].overs;
            if(currInnover.indexOf(".") != -1){
                currInnover = parseInt(currInnover) +1;
            }
        }
    }
    let content_bats = '<option value="">Any Batsmen</option>';
    for(var i in currInn.inning.batsmen){
        let b = currInn.inning.batsmen[i];
        content_bats += '<option value="'+b.batsman_id+'">'+b.name+'</option>';
    }
    mybatsman.innerHTML  = content_bats;

    let content_bowlers = '<option value="">Any Bowlers</option>';
    for(var i in currInn.inning.bowlers){
        let b = currInn.inning.bowlers[i];
        content_bowlers += '<option value="'+b.bowler_id+'">'+b.name+'</option>';
    }
    mybowler.innerHTML  = content_bowlers;

    let content_overs = '';
    for(var i =1;i<=currInnover;i++){
        content_overs += '<option value="'+i+'">'+i+'</option>';
    }
    myover.innerHTML  = content_overs;

    let content_balls = '';
    for(var i =1;i<=6;i++){
        content_balls += '<option value="'+i+'">'+i+'</option>';
    }
    content_balls += '<option value="all">All Balls</option>';
    myballs.innerHTML  = content_balls;

    let content_wickets = '<option value="">All Wickets</option>';
    for(var i in currInn.commentaries){
        if(currInn.commentaries[i].event == 'wicket'){
            let p = ckt_find_player(currInn.commentaries[i].batsman_id,currInn.players);
            content_wickets += '<option value="Delivery_'+(this.value)+'_'+(parseInt(currInn.commentaries[i].over)+1)+'_'+currInn.commentaries[i].xball+'_'+matchId+'.json">'+p.title+', '+currInn.commentaries[i].how_out+'</option>';
        }
    }
    mywickets.innerHTML  = content_wickets;
    callTheBallAfterChange()
});

window.restFilters =  function () {
    var event = new CustomEvent("change", { "detail": "Example of an event" });
    let content_inns = '';
    for(var i in innings){
        content_inns += '<option value="'+innings[i].number+'">'+innings[i].title+'</option>';
    }
    myinnings.innerHTML  = content_inns;
    myinnings.dispatchEvent(event);
}
function ckt_find_player( id, players ) {
	for( var i=0; i<players.length; i++ ) {
		if( players[i]['pid'] == id || players[i]['player_id'] == id ) {
			return players[i];
		}
	}
	return false;
}
mybatsman.addEventListener('change', function () {
    let overs = {};
    let batsD = this.value;
    let bowlD = mybowler.value;
    let currInn = {};
    for(var i in IningData){
        if(myinnings.value == IningData[i].inning.number){
            currInn = IningData[i];
        }
    }
    let batsmens_bawler = [];
    for(var i in currInn.commentaries){
        if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].batsman_id == batsD){
            batsmens_bawler.push(''+currInn.commentaries[i].bowler_id+'');
        }
    }
    let uniqueItems = [...new Set(batsmens_bawler)];
    let content_bowlers = '';
    for(var i in currInn.inning.bowlers){
        let b = currInn.inning.bowlers[i];
        if(uniqueItems.includes(b.bowler_id)){
            content_bowlers += '<option value="'+b.bowler_id+'">'+b.name+'</option>';
        }
    }
    mybowler.innerHTML  = content_bowlers;
    if(bowlD != ''){
        mybowler.value = bowlD;
    }else{
        bowlD = mybowler.value;
    }
    
    for(var i in currInn.commentaries){
        if(bowlD == ''){
            if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].batsman_id == batsD){
                if(overs['key_'+currInn.commentaries[i].over]){
                    overs['key_'+currInn.commentaries[i].over].push(currInn.commentaries[i].xball);
                }else{
                    overs['key_'+currInn.commentaries[i].over] = [currInn.commentaries[i].xball];
                }
            }
        }else{
            if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].batsman_id == batsD && currInn.commentaries[i].bowler_id == bowlD){
                if(overs['key_'+currInn.commentaries[i].over]){
                    overs['key_'+currInn.commentaries[i].over].push(currInn.commentaries[i].xball);
                }else{
                    overs['key_'+currInn.commentaries[i].over] = [currInn.commentaries[i].xball];
                }
            }
        }
    }
    
    let content_overs = '';
    for(var i in overs){
        content_overs += '<option value="'+(parseInt(i.replace('key_',''))+1)+'">'+(parseInt(i.replace('key_',''))+1)+'</option>';
    }
    myover.innerHTML  = content_overs;
    let first_ov = Object.values(overs)[0];
    let content_balls = '';
    for(var i in first_ov){
        content_balls += '<option value="'+first_ov[i]+'">'+first_ov[i]+'</option>';
    }
    content_balls += '<option value="all">All Balls</option>';
    myballs.innerHTML  = content_balls;
    callTheBallAfterChange()
});

mybowler.addEventListener('change', function () {
    let overs = {};
    let bowlerD = this.value;
    let betD = mybatsman.value;
    let currInn = {};
    for(var i in IningData){
        if(myinnings.value == IningData[i].inning.number){
            currInn = IningData[i];
        }
    }
    let bawler_batsmens = [];
    for(var i in currInn.commentaries){
        if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].bowler_id == bowlerD){
            bawler_batsmens.push(''+currInn.commentaries[i].batsman_id+'');
        }
    }
    let uniqueItems = [...new Set(bawler_batsmens)];
    let content_bats = '';
    for(var i in currInn.inning.batsmen){
        let b = currInn.inning.batsmen[i];
        if(uniqueItems.includes(b.batsman_id)){
            content_bats += '<option value="'+b.batsman_id+'">'+b.name+'</option>';
        }
    }
    mybatsman.innerHTML  = content_bats;

    if(betD != ''){
        mybatsman.value = betD;
    }else{
        betD = mybatsman.value;
    }
    
    for(var i in currInn.commentaries){
        if(betD == ''){
            if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].bowler_id == bowlerD){
                if(overs['key_'+currInn.commentaries[i].over]){
                    overs['key_'+currInn.commentaries[i].over].push(currInn.commentaries[i].xball);
                }else{
                    overs['key_'+currInn.commentaries[i].over] = [currInn.commentaries[i].xball];
                }
            }
        }else{
            if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].bowler_id == bowlerD && currInn.commentaries[i].batsman_id == betD){
                if(overs['key_'+currInn.commentaries[i].over]){
                    overs['key_'+currInn.commentaries[i].over].push(currInn.commentaries[i].xball);
                }else{
                    overs['key_'+currInn.commentaries[i].over] = [currInn.commentaries[i].xball];
                }
            }
        }
    }
    
    let content_overs = '';
    for(var i in overs){
        content_overs += '<option value="'+(parseInt(i.replace('key_',''))+1)+'">'+(parseInt(i.replace('key_',''))+1)+'</option>';
    }
    myover.innerHTML  = content_overs;
    let first_ov = Object.values(overs)[0];
    let content_balls = '';
    for(var i in first_ov){
        content_balls += '<option value="'+first_ov[i]+'">'+first_ov[i]+'</option>';
    }
    content_balls += '<option value="all">All Balls</option>';
    myballs.innerHTML  = content_balls;
    callTheBallAfterChange()
});

myover.addEventListener('change', function () {
    let balls = [];
    let balls2 = [];
    let currentover = parseInt(this.value);
    let batsmen = mybatsman.value;
    let mytypeover = currentover - 1;
    let currInn = {};
    for(var i in IningData){
        if(myinnings.value == IningData[i].inning.number){
            currInn = IningData[i];
        }
    }
    for(var i in currInn.commentaries){
        if(currInn.commentaries[i].event != 'overend' && currInn.commentaries[i].over == mytypeover){
            if(batsmen != '' && currInn.commentaries[i].batsman_id == batsmen){
                balls2.push(currInn.commentaries[i].xball);
            }else{
                balls.push(currInn.commentaries[i].xball);
            }
        }
    }
    let content_balls = '';
    if(balls2.length > 0){
        balls = balls2;
    }
    for(var i in balls){
        content_balls += '<option value="'+balls[i]+'">'+balls[i]+'</option>';
    }
    content_balls += '<option value="all">All Balls</option>';
    myballs.innerHTML  = content_balls;
    callTheBallAfterChange()
});

myballs.addEventListener('change', function () {
    let balls = this.value;
    if(balls != 'all'){
        ballsTogether = false;
        callTheBallAfterChange();
    }else{
        ballsTogether = true;
        var options = myballs.options;
        let in_id = myinnings.value;
        let bowl_id = mybowler.value;
        let over_id = myover.value;
        let ballData = [];
        for (let i = 0; i < options.length; i++) {
            if(options[i].value != 'all'){
                let StrName = 'Delivery_'+in_id+'_'+over_id+'_'+(options[i].value)+'_'+matchId+'.json';
                let filePath = baseDire+StrName;
                ballData[i] = httpGetAsyncEntity(filePath);
            }
        }
        playTheseBalls(false,ballData[0],ballData[1],ballData[2],ballData[3],ballData[4],ballData[5])
    }
});

mywickets.addEventListener('change', function () {
    let filePath = baseDire+this.value;
    var ballData = httpGetAsyncEntity(filePath);
    playTheseBalls(false,ballData);
});

function callTheBallAfterChange()
{
    mywickets.value = "";
    let in_id = myinnings.value;
    let bowl_id = mybowler.value;
    let over_id = myover.value;
    let ball_id = myballs.value;
    let StrName = 'Delivery_'+in_id+'_'+over_id+'_'+ball_id+'_'+matchId+'.json';
    let filePath = baseDire+StrName;
    var ballData = httpGetAsyncEntity(filePath);
    playTheseBalls(false,ballData);
}
function httpGetAsyncEntity(theUrl){
    theUrl = APP_URL+theUrl;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send();
    return JSON.parse(xmlHttp.responseText);
}
setAllFilters(mParam.get('entity_matchId'),mParam.get('matchId'));