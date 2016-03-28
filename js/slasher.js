var scene, camera, renderer, light, ambient, clock, delta;
var geometry, material, box;
var floor, mat;
var cageWall = new Array();
var controls, controlsEnabled;
var moveForward, moveBackward, moveLeft, moveRight, canJump, ray;
var velocity = new THREE.Vector3();
var playerHP = 200;
var enemyAttackClock, lastAttack = 0;
var badGuy, enemySpeed = 0.4;
var havePointerLock = checkForPointerLock();
var XAXIS = new THREE.Vector3(1,0,0);
var YAXIS = new THREE.Vector3(0,1,0);
var deathScale = 1;
var kills = 0;

var raycaster = new THREE.Raycaster();

function checkForPointerLock() {
	return 'pointerLockElement' in document || 
	'mozPointerLockElement' in document || 
	'webkitPointerLockElement' in document;
}

init();
animate();

function Enemy(toughness) {
	this.alive = true;
	this.hp = toughness;
	var geometry = new THREE.BoxGeometry( 20, 20, 20 );
	var material = new THREE.MeshPhongMaterial({ color: 0xcc0000, specular: 0xffcccc, shininess: 30, shading: THREE.FlatShading });
	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.position.y = 10;
}

function init() {
    //initilization
    initPointerLock();
    initControls();

    scene = new THREE.Scene();
    clock = new THREE.Clock(true);
    enemyAttackClock = new THREE.Clock(true);
    


    //camera and camera control
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    controls = new THREE.PointerLockControls(camera);
    controls.getObject().position.x = 200;
    controls.getObject().position.z = 200;
    scene.add(controls.getObject());

    badGuy = new Enemy(3);
    badGuy.mesh.position.x = -200;
    badGuy.mesh.position.z = -200;
    scene.add(badGuy.mesh);
    
    //level builing
    //ground
    floor = new THREE.Mesh(new THREE.BoxGeometry(1000, 1, 1000), new THREE.MeshPhongMaterial({ color: 0x009933, specular: 0xccffdd, shininess: 10, shading: THREE.FlatShading }));
    floor.position.y = -10;
    scene.add(floor);
    mat = new THREE.Mesh(new THREE.BoxGeometry(500, 10, 500), new THREE.MeshPhongMaterial({ color: 0xd2b48c, specular: 0xdfcaae, shininess: 10, shading: THREE.FlatShading }));
    mat.position.y = -10;
    scene.add(mat);
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
    document.getElementById('kills').innerHTML = "Kills: 0";
    
    window.addEventListener( 'resize', onWindowResize, false );

}

function animate() {
	requestAnimationFrame( animate );
	delta = clock.getDelta();
	updateControls();
	moveEnemy(badGuy);
	renderer.render( scene, camera );

}

function moveEnemy(enemy) {
	var distX = controls.getObject().position.x - enemy.mesh.position.x;
	var distZ = controls.getObject().position.z - enemy.mesh.position.z;
	var dist = Math.sqrt(distX*distX + distZ*distZ);
	if (controlsEnabled){
		lastAttack  += enemyAttackClock.getDelta();
		if (enemy.alive){
			if (dist > 10) {
				enemy.mesh.position.x += distX*enemySpeed*delta;
				enemy.mesh.position.z += distZ*enemySpeed*delta;
			} 
			if (dist < 40) {
				if (lastAttack > 1) {
					playerHP -= 20;
					document.getElementById('HPBar').style.width = playerHP + 'px';
					lastAttack = 0;
					if (playerHP <= 0) {
						gameOver();
					}
				}
			}
			enemy.mesh.lookAt(new THREE.Vector3(controls.getObject().position.x, enemy.mesh.position.y, controls.getObject().position.z));
		} else {
			deathScale -= 0.02
			enemy.mesh.rotateOnAxis(YAXIS, 0.05);
			enemy.mesh.scale.set(deathScale, deathScale, deathScale);
			if (deathScale <= 0.05) {
				scene.remove(enemy.mesh);
				createEnemy();
				deathScale = 1;
				kills +=1;
				document.getElementById('kills').innerHTML = "Kills: " + kills;
			}
			
		}
	}
}

function gameOver(){
	if (kills >  localStorage.getItem("highscore")){
    	localStorage.setItem("highscore", kills);
	}
	controlsEnabled = false;
	controls.Enabled = false;
	document.getElementById('killscreen').style.display = 'box';
	document.getElementById('killscreen').style.display = '-webkit-box';
	document.getElementById('killscreen').style.display = '-moz-box';
	document.getElementById('killscreen').innerHTML = "Number of kills: " + kills + ". Highscore: " + localStorage.getItem("highscore");

}

function createEnemy(){
	badGuy = new Enemy(3);
	var badSpawn = true;
	while (badSpawn) {
		badGuy.mesh.position.x = Math.floor((Math.random() * 500) -240);
		badGuy.mesh.position.z = Math.floor((Math.random() * 500) -240);
		var distX = controls.getObject().position.x - badGuy.mesh.position.x;
		var distZ = controls.getObject().position.z - badGuy.mesh.position.z;
		var dist = Math.sqrt(distX*distX + distZ*distZ);
		if (dist > 50) {
			badSpawn = false;
		}
	}
	enemySpeed += 0.05;
	scene.add(badGuy.mesh);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function updateControls() {
	var dir = controls.getDirection();
	dir.normalize();
	raycaster.set(controls.getObject().position, dir);

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
	document.addEventListener('click', onClick, false);
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

function onClick(e) {
	if (raycaster.intersectObject(badGuy.mesh, true).length > 0) {
		console.log("hit");
		handleShot(badGuy);
	}	
}

function handleShot(enemy){
	badGuy.hp -= 1;
	if (badGuy.hp == 0) {
		badGuy.alive = false;
	}
}
