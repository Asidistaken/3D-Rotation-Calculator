let scene, camera, renderer, currentObject;
const rotationValues = document.getElementById('rotation-values');

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('upload').addEventListener('change', handleUpload);
    document.getElementById('cube').addEventListener('click', () => addShape('cube'));
    document.getElementById('quadrangularPrism').addEventListener('click', () => addShape('quadrangularPrism'));
    document.getElementById('cone').addEventListener('click', () => addShape('cone'));

    document.getElementById('rotateXPositive').addEventListener('click', () => rotateObject('X', Math.PI / 18));
    document.getElementById('rotateXNegative').addEventListener('click', () => rotateObject('X', -Math.PI / 18));
    document.getElementById('rotateYPositive').addEventListener('click', () => rotateObject('Y', Math.PI / 18));
    document.getElementById('rotateYNegative').addEventListener('click', () => rotateObject('Y', -Math.PI / 18));
    document.getElementById('rotateZPositive').addEventListener('click', () => rotateObject('Z', Math.PI / 18));
    document.getElementById('rotateZNegative').addEventListener('click', () => rotateObject('Z', -Math.PI / 18));

    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
}

function handleUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            let loader;
            if (file.name.toLowerCase().endsWith('.gltf') || file.name.toLowerCase().endsWith('.glb')) {
                loader = new THREE.GLTFLoader();
            } else if (file.name.toLowerCase().endsWith('.fbx')) {
                loader = new THREE.FBXLoader();
            } else if (file.name.toLowerCase().endsWith('.obj')) {
                loader = new THREE.OBJLoader();
            } else if (file.name.toLowerCase().endsWith('.stl')) {
                loader = new THREE.STLLoader();
            } else {
                showErrorAlert('Unsupported file format.');
                return;
            }
            loader.parse(contents, '', function(gltf) {
                if (currentObject) {
                    scene.remove(currentObject);
                }
                currentObject = gltf.scene;
                centerObject();
                scene.add(currentObject);
                updateRotationDisplay();
            }, function (error) {
                showErrorAlert('Error loading the file.');
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

function addShape(type) {
    if (currentObject) {
        scene.remove(currentObject);
    }
    let geometry;
    switch(type) {
        case 'cube':
            geometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        case 'quadrangularPrism':
            geometry = new THREE.BoxGeometry(1, 2, 1);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(1, 2, 8);
            break;
        default:
            return;
    }
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    currentObject = new THREE.Mesh(geometry, material);
    centerObject();
    scene.add(currentObject);
    updateRotationDisplay();
}

function centerObject() {
    if (currentObject) {
        const boundingBox = new THREE.Box3().setFromObject(currentObject);
        const center = boundingBox.getCenter(new THREE.Vector3());
        currentObject.position.sub(center);
    }
}

function zoomIn() {
    camera.position.z -= 0.5;
}

function zoomOut() {
    camera.position.z += 0.5;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    updateRotationDisplay();
}

function updateRotationDisplay() {
    if (currentObject) {
        const { x, y, z } = currentObject.rotation;
        rotationValues.innerText = `Rotation: X: ${THREE.MathUtils.radToDeg(x).toFixed(2)}, Y: ${THREE.MathUtils.radToDeg(y).toFixed(2)}, Z: ${THREE.MathUtils.radToDeg(z).toFixed(2)}`;
    }
}

function rotateObject(axis, angle) {
    switch (axis) {
        case 'X':
            currentObject.rotateX(angle);
            break;
        case 'Y':
            currentObject.rotateY(angle);
            break;
        case 'Z':
            currentObject.rotateZ(angle);
            break;
        default:
            break;
    }
    updateRotationDisplay();
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK'
    });
}
