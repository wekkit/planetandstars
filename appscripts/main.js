//---------------------------------------
//  INITIALISATION OF GRAPHICS LIBRARIES & GLOBAL VARIABLES
//---------------------------------------

$("#info").hide(); //initialise info pane, hide on load and create var to keep track of hide status
var info = false

var two = new Two({fullscreen: true}).appendTo(document.getElementById("two")); //initialise two.js in two div

var WIDTH = window.innerWidth; //initialise three.js in three div
var HEIGHT = window.innerHeight; 
var renderer = new THREE.WebGLRenderer({alpha:true});
var camera = new THREE.PerspectiveCamera( 45, WIDTH/HEIGHT, 0.1, 10000 );
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("three").appendChild(renderer.domElement);
var scene = new THREE.Scene();
scene.add(camera);
camera.position.z = 80;

var anim1; //create variable to track state of main sphere

var ydirection = 0; //create vars to track movement direction based on device orientation
var xdirection = 0;          
window.addEventListener('deviceorientation', function(event){
    ydirection = event.beta/1000; //divide by 1000 to avoid overstimulation of rotation
    xdirection = event.gamma/1000;
});

//---------------------------------------
//  CREATION OF 3D ELEMENTS (three.js)
//---------------------------------------

//skybox (background)
var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000); //extremely large cube in distance to create background
var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

//tracker sphere
var geometry = new THREE.SphereGeometry(1,80,20); //geometry for invisible tracker sphere to facilitate animation
var material2 = new THREE.MeshBasicMaterial({transparent: true, opacity:0}); //make material for tracker sphere invisible
var mesh = new THREE.Points(geometry, material2);
mesh.position.set(0,-30,0);
scene.add(mesh);

//main sphere
var geometry2 = new THREE.SphereGeometry(15,80,20); //geometry for main sphere
var geometryReset = new THREE.SphereGeometry(15,80,20); //geometry for main sphere to return to after scattering
var material = new THREE.PointsMaterial({size:1, vertexColors: true, transparent: true, opacity:1}); //point-based material for main sphere, each point represented by a vector in an array
var mesh2 = new THREE.Points(geometry2,material);
mesh2.sortParticles = true;
scene.add(mesh2);

var white = [];
for (var i = 0; i < geometry.vertices.length; i++) {
  white[i] = new THREE.Color();
  white[i].setHSL(1,1,1);
};
geometry2.colors = white;


renderer.render(scene, camera);

//---------------------------------------
//  CREATION OF 2D ELEMENTS (two.js)
//---------------------------------------

// DRAW MAIN BUTTON
var button1 = two.makeRectangle(0,0,two.width*2,two.height*2); //create invisible button covering entire screen to toggle between states
button1.opacity = 0;
button1.noStroke();

// DRAW INFO BUTTON
var button2 = two.makeCircle(100,100,80); //draw info button
button2.fill = '#ffffff'
button2.stroke = '#cccccc';
button2.linewidth = 10;

var circle = two.makeCircle(100,60,12); //draw dot of the 'i' on info button
circle.fill = "#cccccc"
circle.noStroke();

var line = two.makeLine(100, 90, 100, 160); //draw line of 'i' on info button
line.linewidth = 10;
line.stroke = "#cccccc"

var group = two.makeGroup(button2, circle, line); //group elements of info button, scale and translate to upper-right corner
group.scale = 0.5;
group.translation.set(two.width*.86, two.height*.02);

two.update(); //place elements on canvas to add event listeners

//BUTTON LISTENERS
button1._renderer.elem.addEventListener('click', function(){ //on button press
if (info === false) { 
      if (anim1 === false) { //switch states based on movement of tracker sphere
        anim1 = true;
    } else {anim1 = false};
  } else { //if info panel is up, make it disappear
    $("#info").fadeOut();
    info = false;
  }
});

button2._renderer.elem.addEventListener('click', function(){ //toggle visibility of info pane with info button
  if (info === false) {
    $("#info").slideDown();
    info = true;
  } else {
    $("#info").fadeOut();
    info = false;
  }
});

//---------------------------------------
//  ANIMATION
//---------------------------------------

function render (){ //render at 60fps
  var vertices = mesh2.geometry.vertices;
  geometry2.verticesNeedUpdate = true;
  geometry2.dynamic = true;
  mesh2.rotation.x += ydirection; //always move main sphere according to device orientation
  mesh2.rotation.z += xdirection; 

  if (anim1 === true) { //if switch is pressed, make tracker sphere move from y=-35 to y=30. animations are dependant on position of tracker sphere along y-axis
    mesh.position.y += (35 - mesh.position.y)/60;
  } else {
    mesh.position.y += (-30 - mesh.position.y)/60;
  }
  
  if (mesh.position.y >= 25) { //when tracker sphere goes past 25 on y-axis,
    skyboxMaterial.color.setHex(0x333333); //set background color to grey
    material.color.setHex(0xffffff); //set particle color to white
    mesh2.scale.x += (3 - mesh2.scale.x)/20; //increase scale of sphere by 3x
    mesh2.scale.y += (3 - mesh2.scale.y)/20;
    mesh2.scale.z += (3 - mesh2.scale.z)/20;
    material.size += (.5 - material.size) /20; //shrink size of particles to 0.5x
  } else { //if tracker sphere is below 25 on y-axis,
    skyboxMaterial.color.setHex(0xf9f9f9); //set background color to white
    material.color.setHex(0x000000); //set particle color to place
    mesh2.scale.x += (1 - mesh2.scale.x)/20; //return scale of sphere to 100%
    mesh2.scale.y += (1 - mesh2.scale.y)/20;
    mesh2.scale.z += (1 - mesh2.scale.z)/20;
    material.size += (1 - material.size) /20; //return size of particles to 100%
  }

  for (var i = 0; i < geometry.vertices.length; i++) { //for individual particles of the sphere,
    if (geometry2.vertices[i].y <= mesh.position.y) { //if the tracker sphere has gone past particle on y-axis,
      if (mesh.position.y < 25) { //and the tracker sphere has not gone past 25 on y-axis
        geometry2.vertices[i].x -= (Math.random()-.5); //scramble particle
        geometry2.vertices[i].y -= (Math.random()-.5);
        geometry2.vertices[i].z -= (Math.random()-.5);
      } //if tracker sphere has gone past 25 on y-axis, particles do not move.
    } else { //if tracker sphere is not past particle on y-axis at all
        geometry2.vertices[i].x = geometryReset.vertices[i].x; //return particle to initial geometry.
        geometry2.vertices[i].y = geometryReset.vertices[i].y;
        geometry2.vertices[i].z = geometryReset.vertices[i].z;
    }
  };

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

render();


//---------------------------------------
//  READY
//---------------------------------------

$(document).ready(function() {
    $(window).load(function() {
        renderer.render(scene, camera);
    });
});

