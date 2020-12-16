
window.onload = function(){
    headerStart();
    bindBurger();
    initBabylonJS();
    bindScrollEvent();
}

function headerStart(){
    document.getElementById("headerElement").classList.add("active");
}

async function initBabylonJS(){
    
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true); 

    var createScene = async () => {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(.5, .5, .5);
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogStart = 15;
        scene.fogEnd = 25;
        scene.fogColor = new BABYLON.Color3(.5, .5, .5);

        var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 6), scene);
        //camera.attachControl(canvas, true);

        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
        light1.intensity = .2;
        light1.diffuse = new BABYLON.Color3(.5, .5, .5);

        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 0, -25), scene);
        light2.intensity = 100;
        light2.range = 100;
        light2.diffuse = new BABYLON.Color3(.5, .5, .5);
        //var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

        return scene;
    };
    var scene = await createScene(); 

    loadMesh(scene);

    //createImagePlane(scene);

    engine.runRenderLoop(function() {
        scene.render();
    });
    window.addEventListener("resize", function () {
        engine.resize();
    });
}

function createImagePlane(scene){
    let plane = BABYLON.MeshBuilder.CreatePlane("plane",{size:10}, scene);
    plane.position = new BABYLON.Vector3(0, 0, 5);
    plane.visibility = 0.75;

    let planeMaterial = new BABYLON.StandardMaterial("planeMat", scene);
    planeMaterial.diffuseTexture = new BABYLON.Texture("src/grad.png");
    planeMaterial.backFaceCulling = false;
    planeMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;
    
    plane.material = planeMaterial;
}

function loadMesh(scene){
    BABYLON.SceneLoader.LoadAssetContainer("./src/models/", "tube.glb", scene, function (container) {
        var meshes = container.meshes;
        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            mesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
            mesh.scaling = new BABYLON.Vector3(2,2,2);
        }
        meshes[0].position = new BABYLON.Vector3(0,0,50);
        var materials = container.materials;
        for (let i = 0; i < materials.length; i++) {
            const material = materials[i];
            material.backFaceCulling = false;
        }
        container.addAllToScene();
        runAnimation(meshes[0], scene);
    });
}
let speed = .2;
function runAnimation(mesh, scene){
    let meshes = [];
    for (let i = 0; i < 4; i++) {
        let clone = mesh.clone();
        switch (i) {
            case 0:
                clone.position.z = -24.48;
            break;
            case 1:
                clone.position.z = -16.32;
            break;
            case 2:
                clone.position.z = -8.16;
            break;
            case 3:
                clone.position.z = 0;
            break;
        }  
        meshes.push(clone);      
    }
    scene.registerBeforeRender(function(){
        let deltaTime;
        if(scene.getLastFrameDuration){
            deltaTime = scene.getLastFrameDuration();
        }else{
            deltaTime = 10;
        }
        for (let i = 0; i < meshes.length; i++) {
            const mesh = meshes[i];
            mesh.translate(BABYLON.Axis.Z, speed*deltaTime /100, BABYLON.Space.WORLD);
            if(mesh.position.z > 8.16){
                mesh.position.z = -24.48;
            }
        }
    });
}

function bindBurger(){
    var burgerElement = document.getElementById("navigationTrigger");    
    function toggleBurgerClass(e){
        let parent = e.srcElement.closest("#navigation");
        if(!parent.classList.contains("active")){
            parent.classList.add("active");
        }else{
            parent.classList.remove("active");
        }
    }
    burgerElement.addEventListener("click", toggleBurgerClass);
}


class scrollListener{
    elementCollection;
    elementsOnScreen = [];
    threshold = 100;
    activeClass = "activeOnScreen";

    contentContainer;

    constructor(){
        this.elementCollection = document.getElementsByClassName("scrollableContent");
        this.elementsOnScreen = [];
        this.contentContainer = document.getElementsByClassName("content")[0];
        this.contentContainer.onscroll = this.handleScroll;
    }
    handleScroll = ()=>{
        for (let i = 0; i < this.elementCollection.length; i++) {
            const element = this.elementCollection[i];
            this.checkElement(element);
        }
    }
    checkElement = (element)=>{
        let rect = element.getBoundingClientRect();
        let viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

        let above = rect.bottom - this.threshold < 0;
        let below = rect.top - viewHeight + this.threshold >= 0;  
        if(!below && !above){
            this.activateElement(element);
        }else{
            this.deactivateElement(element);
        }
    }
    activateElement = (e)=>{
        if(!this.elementsOnScreen.includes(e)){
            e.classList.add(this.activeClass);
            this.elementsOnScreen.push(e);
        }
    }
    deactivateElement = (e)=>{
        if(this.elementsOnScreen.includes(e)){
            for( var i = 0; i < this.elementsOnScreen.length; i++){
                if ( this.elementsOnScreen[i] === e) {
                    e.classList.remove(this.activeClass);
                    this.elementsOnScreen.splice(i, 1);
                }
            }
        }
    }
}

function bindScrollEvent(){
    let listener = new scrollListener();
}
























function writeText(){
    let text = [
        "Hallo Welt!",
        "Ich mag Kuchen"
    ]
    let wrapper = document.getElementById("selfWritingText");
    for(let i = 0; i < text.length; i++){
        if(i == 0){
            writeLine(wrapper, text[i]);
        }else{
            setTimeout(function(){
                writeLine(wrapper, text[i]);
            }, text[i-1].length * 100);
        }
    }
}
function writeLine(wrapper, line){
    let target = document.createElement("p");
    wrapper.appendChild(target);
    writeChar(target, line);
}
function writeChar(target, text){
    if(text.length > 0){
        target.innerHTML = text[text.length-1]+target.innerHTML;
        setTimeout(function(){
            text = text.slice( 0, -1 );
            writeChar(target, text)
        },100)
    }
}