import * as RAPIER from '@dimforge/rapier2d-compat';
import * as THREE from 'three';

async function init() {
    await RAPIER.init({});
    
    const gravity = { x: 0.0, y: -9.81 };
    const world = new RAPIER.World(gravity);
    const eventQueue = new RAPIER.EventQueue(true);

    const container = document.getElementById('canvas-container');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);
    
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 5, 30);
    camera.lookAt(0, 0, 0);
    
    let isIsometric = false;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const worldScale = 50;
    
    const getWorldCoords = (screenX, screenY) => {
        const canvasRect = renderer.domElement.getBoundingClientRect();
        const x = (screenX - canvasRect.left) / canvasRect.width;
        const y = (screenY - canvasRect.top) / canvasRect.height;
        
        const fov = camera.fov * (Math.PI / 180);
        const heightAtDepth = 2 * Math.tan(fov / 2) * camera.position.z;
        const widthAtDepth = heightAtDepth * camera.aspect;
        
        const worldX = (x - 0.5) * widthAtDepth;
        const worldY = (0.5 - y) * heightAtDepth;
        
        return {
            x: worldX,
            y: worldY
        };
    };

    let groundColor = new THREE.Color(0x808080);
  

    const createGround = () => {
        const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
        const groundBody = world.createRigidBody(groundBodyDesc);
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10, 0.1);
        const groundCollider = world.createCollider(groundColliderDesc, groundBody);

        groundBody.setTranslation({ x: 0, y: -5, z: 0 });

        groundCollider.userData = { isGround: true };
        groundCollider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    };
    createGround();

    const groundGeometry = new THREE.BoxGeometry(20, 0.1, 0.01);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: groundColor, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(0, -5, 0);
    scene.add(ground);

    const createBall = (x, y, color) => {
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        bodyDesc.setTranslation(x, y, 0);
        const body = world.createRigidBody(bodyDesc);

        const radius = 0.5;
        const colliderDesc = RAPIER.ColliderDesc.ball(radius);
        const collider = world.createCollider(colliderDesc, body);
        collider.userData = { ball: { body, collider, color, radius } };
        collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

        const ballGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(color) });
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        
        ball.position.set(x, y, 0);
        scene.add(ball);
        
        balls.push({ body, collider, color, radius, mesh: ball });
    };

    const balls = [];
    const ballPositions = [
        { x: -3, y: 15, color: '#ff0000' },
        { x: 0, y: 17, color: '#00ff00' },
        { x: 3, y: 19, color: '#0000ff' }
    ];

    ballPositions.forEach(p => createBall(p.x, p.y, p.color));

 

    container.addEventListener('click', (event) => {
        const worldCoords = getWorldCoords(event.clientX, event.clientY);
        const randomColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        createBall(worldCoords.x, worldCoords.y, randomColor);
    });

    document.getElementById('cameraBtn').addEventListener('click', () => {
        isIsometric = !isIsometric;
        
        if (isIsometric) {
            camera.position.set(20, 20, 20);
            camera.lookAt(0, 0, 0);
        } else {
            camera.position.set(0, 5, 30);
            camera.lookAt(0, 0, 0);
        }
        camera.updateProjectionMatrix();
    });

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    function animate() {
        requestAnimationFrame(animate);

        world.step(eventQueue);

        eventQueue.drainCollisionEvents((handle1, handle2, started) => {
            if (!started) return;
            
            console.log('Collision detected');
            
            const collider1 = world.getCollider(handle1);
            const collider2 = world.getCollider(handle2);
            
            if (collider1.userData?.isGround) {
                const ball = collider2.userData?.ball;
                if (ball) {
                    console.log('Ground hit by ball, color:', ball.color);
                    groundColor.set(ball.color);
                    ground.material.color = groundColor;
                }
            } else if (collider2.userData?.isGround) {
                const ball = collider1.userData?.ball;
                if (ball) {
                    console.log('Ground hit by ball, color:', ball.color);
                    groundColor.set(ball.color);
                    ground.material.color = groundColor;
                }
            }
        });

        balls.forEach(ball => {
            const pos = ball.body.translation();
            
            ball.mesh.position.set(pos.x, pos.y, 0);
        });

        renderer.render(scene, camera);
    }

    animate();
}

init();
