$("#info").hide();
var info = false

//INITIALIZE TWO.JS
var el = document.getElementById("two"),
    two = new Two({ 
        fullscreen: true
    });
 
two.appendTo(el);

//INITIALIZE THREE.JS
var WIDTH = window.innerWidth,
HEIGHT = window.innerHeight,
bpm = 468.75;

var renderer = new THREE.WebGLRenderer({alpha:true});
var camera = new THREE.PerspectiveCamera( 45, WIDTH/HEIGHT, 0.1, 10000 );

renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("three").appendChild(renderer.domElement);

var ydirection = 0; 
var xdirection = 0;          
window.addEventListener('deviceorientation', function(event){
    ydirection = event.beta/1000;
    xdirection = event.gamma/1000;
});

var scene = new THREE.Scene();
var anim1;

scene.add(camera);
camera.position.z = 80;

//ELEMENTS
//skybox
var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

//SPHERES
var geometry = new THREE.SphereGeometry(1,80,20);
var geometry2 = new THREE.SphereGeometry(15,80,20);
var geometryReset = new THREE.SphereGeometry(15,80,20);
var material = new THREE.PointsMaterial({size:1, vertexColors: true, transparent: true, opacity:1});
var material2 = new THREE.MeshBasicMaterial({transparent: true, opacity:0});

var white = [];
for (var i = 0; i < geometry.vertices.length; i++) {
  white[i] = new THREE.Color();
  white[i].setHSL(1,1,1);
  // white[i].setHSL(Math.random(),1,0.5);
};
var black = [];
for (var i = 0; i < geometry.vertices.length; i++) {
  black[i] = new THREE.Color();
  black[i].setHSL(0,0,0);
};

geometry.colors = black;
geometry2.colors = white;

var mesh = new THREE.Points(geometry, material2);
mesh.position.set(0,-30,0);

var mesh2 = new THREE.Points(geometry2,material);
mesh2.sortParticles = true;

scene.add(mesh);
scene.add(mesh2);

renderer.render(scene, camera);

//ANIMATION
function render (){

  if (anim1 === true) {
    mesh.position.y += (35 - mesh.position.y)/60;
  } else {
    mesh.position.y += (-30 - mesh.position.y)/60;
  }
  
  mesh2.rotation.x += ydirection; 
  mesh2.rotation.z += xdirection; 

  var vertices = mesh2.geometry.vertices;

  if (mesh.position.y >= 25) {
    skyboxMaterial.color.setHex(0x333333);
    material.color.setHex(0xffffff);
    mesh2.scale.x += (3 - mesh2.scale.x)/20;
    mesh2.scale.y += (3 - mesh2.scale.y)/20;
    mesh2.scale.z += (3 - mesh2.scale.z)/20;
    material.size += (.5 - material.size) /20;
  } else {
    skyboxMaterial.color.setHex(0xf9f9f9);
    material.color.setHex(0x000000);
    mesh2.scale.x += (1 - mesh2.scale.x)/20;
    mesh2.scale.y += (1 - mesh2.scale.y)/20;
    mesh2.scale.z += (1 - mesh2.scale.z)/20;
    material.size += (1 - material.size) /20;
  }

  for (var i = 0; i < geometry.vertices.length; i++) {
    if (geometry2.vertices[i].y <= mesh.position.y) {
      if (mesh.position.y < 25) {
        geometry2.vertices[i].x -= (Math.random()-.5); 
        geometry2.vertices[i].y -= (Math.random()-.5);
        geometry2.vertices[i].z -= (Math.random()-.5);
      }
    } else {
        geometry2.vertices[i].x = geometryReset.vertices[i].x;
        geometry2.vertices[i].y = geometryReset.vertices[i].y;
        geometry2.vertices[i].z = geometryReset.vertices[i].z;
    }
  };

  geometry2.verticesNeedUpdate = true;
  geometry2.dynamic = true;


  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

render();

//BUTTON
var button1 = two.makeRectangle(0,0,two.width*2,two.height*2);
button1.opacity = 0;
button1.noStroke();

var button2 = two.makeCircle(100,100,80);
button2.fill = '#ffffff'
button2.stroke = '#cccccc';
button2.linewidth = 10;
var circle = two.makeCircle(100,60,12);
circle.fill = "#cccccc"
circle.noStroke();
var line = two.makeLine(100, 90, 100, 160);
line.linewidth = 10;
line.stroke = "#cccccc"

var group = two.makeGroup(button2, circle, line);
group.scale = 0.5;
group.translation.set(two.width*.86, two.height*.02);


two.update();

button1._renderer.elem.addEventListener('click', function(){
if (info === false) { //on button 1 press
      if (anim1 === false) {
        anim1 = true;
    } else {anim1 = false};
  } else {
    $("#info").fadeOut();
    info = false;
  }
});

button2._renderer.elem.addEventListener('click', function(){
  if (info === false) {
    $("#info").slideDown();
    info = true;
  } else {
    $("#info").fadeOut();
    info = false;
  }
});

//READY
$(document).ready(function() {
    $(window).load(function() {
        renderer.render(scene, camera);
    });
});

