var scene, camera, renderer, light, ambient, clock;
var geometry, material, mesh;
var floor;
var controls, controlsEnabled;
var moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    canJump;
var velocity = new THREE.Vector3();

var havePointerLock = checkForPointerLock();

function checkForPointerLock() {
    return 'pointerLockElement' in document || 
        'mozPointerLockElement' in document || 
        'webkitPointerLockElement' in document;
}


init();
animate();

function init() {
    initPointerLock();
    initControls();
    
    scene = new THREE.Scene();
    clock = new THREE.Clock(true);
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    

    geometry = new THREE.BoxGeometry( 20, 20, 20 )
    material = new THREE.MeshPhongMaterial({ color: 0xcc0000, specular: 0xffcccc, shininess: 30, shading: THREE.FlatShading });
    
    floor = new THREE.Mesh(new THREE.BoxGeometry(1000, 1, 1000), new THREE.MeshPhongMaterial({ color: 0x009933, specular: 0xccffdd, shininess: 10, shading: THREE.FlatShading }));
    floor.position.y = -10;
    scene.add(floor);
    
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    
    ambient = new THREE.AmbientLight( 0x666666 ); // soft white light
    scene.add( ambient );
    
    light = new THREE.PointLight( 0xffffff, 1, 500 ); 
    light.position.set(0, 300, 0);
    scene.add( light );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );
    updateControls();
    renderer.render( scene, camera );

}

function updateControls() {
    if (controlsEnabled) {
        var delta = clock.getDelta();
        var walkingSpeed = 300.0;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta;

        if (moveForward) velocity.z -= walkingSpeed * delta;
        if (moveBackward) velocity.z += walkingSpeed * delta;
        if (moveLeft) velocity.x -= walkingSpeed * delta;
        if (moveRight) velocity.x += walkingSpeed * delta;

        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY(velocity.y * delta);
        controls.getObject().translateZ(velocity.z * delta);

        if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }
    }
}

function initPointerLock() {
    var element = document.body;
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    
    if (havePointerLock) {
        var pointerlockchange = function (event) {
            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
                controlsEnabled = true;
                controls.enabled = true;
            } else {
                controlsEnabled = false;
                controls.enabled = false;
            } 
        };

        var pointerlockerror = function (event) {
            element.innerHTML = 'PointerLock Error';
        };

        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        var requestPointerLock = function(event) {
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock(); 
        };
        element.addEventListener('click', requestPointerLock, false);
    } else {
        element.innerHTML = 'Bad browser; No pointer lock';
    }
}

function initControls() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
}

function onKeyDown(e) {
    switch (e.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = true;
            break;
        case 37: // left
        case 65: // a
            moveLeft = true;
            break;
        case 40: // down
        case 83: // s
            moveBackward = true;
            break;
        case 39: // right
        case 68: // d
            moveRight = true;
            break;
        case 32: // space
            if (canJump === true) velocity.y += 350;
            canJump = false;
            break;
    }
}

function onKeyUp(e) {
    switch(e.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = false;
            break;
        case 37: // left
        case 65: // a
            moveLeft = false;
            break;
        case 40: // down
        case 83: // s
            moveBackward = false;
            break;
        case 39: // right
        case 68: // d
            moveRight = false;
            break;
    }
}
