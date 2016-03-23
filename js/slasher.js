var scene, camera, renderer, light, ambient, clock, delta;
var geometry, material, box;
var floor;
var cageWall = new Array();
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
    //initilization
    initPointerLock();
    initControls();
    
	scene = new THREE.Scene();
    clock = new THREE.Clock(true);
    
    //camera and camera control
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    
    //TODO: change this. creates box
    geometry = new THREE.BoxGeometry( 20, 20, 20 )
    material = new THREE.MeshPhongMaterial({ color: 0xcc0000, specular: 0xffcccc, shininess: 30, shading: THREE.FlatShading });
    box = new THREE.Mesh( geometry, material );
    scene.add( box );
    
    //level builing
    //ground
    floor = new THREE.Mesh(new THREE.BoxGeometry(1000, 1, 1000), new THREE.MeshPhongMaterial({ color: 0x009933, specular: 0xccffdd, shininess: 10, shading: THREE.FlatShading }));
    floor.position.y = -10;
    scene.add(floor);
    //cage
    for (i = 0; i < 50; i+=2) {
        cageWall.push(new THREE.Mesh(new THREE.BoxGeometry(5, 500, 5), new THREE.MeshPhongMaterial({ color: 0xb0c4de, specular: 0xcae1ff, shininess: 10, shading: THREE.FlatShading })));
        cageWall[i].position.x = i*10-250;
        cageWall[i].position.z = 250;
        scene.add(cageWall[i]);  
        cageWall.push(new THREE.Mesh(new THREE.BoxGeometry(5, 500, 5), new THREE.MeshPhongMaterial({ color: 0xb0c4de, specular: 0xcae1ff, shininess: 10, shading: THREE.FlatShading })));
        cageWall[i+1].position.x = i*10-250;
        cageWall[i+1].position.z = -250;
        scene.add(cageWall[i+1]);  
    }
    for (i = 0; i <= 50; i+=2) {
        cageWall.push(new THREE.Mesh(new THREE.BoxGeometry(5, 500, 5), new THREE.MeshPhongMaterial({ color: 0xb0c4de, specular: 0xcae1ff, shininess: 10, shading: THREE.FlatShading })));
        cageWall[i+50].position.z = i*10-250;
        cageWall[i+50].position.x = 250;
        scene.add(cageWall[i+50]);  
        cageWall.push(new THREE.Mesh(new THREE.BoxGeometry(5, 500, 5), new THREE.MeshPhongMaterial({ color: 0xb0c4de, specular: 0xcae1ff, shininess: 10, shading: THREE.FlatShading })));
        cageWall[i+51].position.z = i*10-250;
        cageWall[i+51].position.x = -250;
        scene.add(cageWall[i+51]);  
    }

    
    //lighting
    ambient = new THREE.AmbientLight( 0x666666 ); // soft white light
    scene.add( ambient );
    
    light = new THREE.PointLight( 0xffffff, 1, 500 ); 
    light.position.set(0, 300, 0);
    scene.add( light );
    
    //rendered
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    
    window.addEventListener( 'resize', onWindowResize, false );

}

function animate() {
    requestAnimationFrame( animate );
    delta = clock.getDelta();
    updateControls();
    moveEnemy(box);
    renderer.render( scene, camera );

}

function moveEnemy(enemy) {
    var distX = controls.getObject().position.x - enemy.position.x;
    var distZ = controls.getObject().position.z - enemy.position.z;
    var dist = Math.sqrt(distX*distX + distZ*distZ);
    if (dist > 30){
        enemy.position.x += distX*.4*delta;
        enemy.position.z += distZ*.4*delta;
    }
    enemy.lookAt(new THREE.Vector3(controls.getObject().position.x, enemy.y, controls.getObject().position.z));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function updateControls() {
    if (controlsEnabled) {
        var walkingSpeed = 600.0;

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

        if (controls.getObject().position.y < 25) {
            velocity.y = 0;
            controls.getObject().position.y = 25;
            canJump = true;
        }
        if (controls.getObject().position.x < -245) {
            velocity.x = 0;
            controls.getObject().position.x = -245;
        }
        if (controls.getObject().position.x > 245) {
            velocity.x = 0;
            controls.getObject().position.x = 245;
        }
        if (controls.getObject().position.z < -245) {
            velocity.z = 0;
            controls.getObject().position.z = -245;
        }
        if (controls.getObject().position.z > 245) {
            velocity.z = 0;
            controls.getObject().position.z = 245;
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
                blocker.style.display = 'none';
            } else {
                controlsEnabled = false;
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';
				instructions.style.display = '';
            } 
        };

        var pointerlockerror = function (event) {
            element.innerHTML = 'PointerLock Error';
            instructions.style.display = '';
        };

        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        var requestPointerLock = function(event) {
            instructions.style.display = 'none';
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            if ( /Firefox/i.test( navigator.userAgent ) ) {
                var fullscreenchange = function ( event ) {
                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                        element.requestPointerLock();
                    }
                };
                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } else {
                element.requestPointerLock();
            }
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
