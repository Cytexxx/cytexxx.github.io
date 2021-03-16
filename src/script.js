
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

    var greyColor = new BABYLON.Color3(.5,.5,.5);
    var color1 = new BABYLON.Color3(0, 0.4392, 0.006);
    var color2 = new BABYLON.Color3(0.0274, 0.2745, 0.4666);
    var color1hell = new BABYLON.Color3(color1.r*2, color1.g*2, color1.b*2);
    var color2hell = new BABYLON.Color3(color2.r*2, color2.g*2, color2.b*2);

    var createScene = async () => {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(.2, .2, .2);
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogStart = 20;
        scene.fogEnd = 25;
        scene.fogColor = new BABYLON.Color3(.2, .2, .2);

        var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0, 0, 6), scene);
        
                 
        if(canvas.width < canvas.height){ 
            console.log("HORIZONTAL")
            scene.activeCamera.fovMode = BABYLON.FOVMODE_HORIZONTAL_FIXED;
        }else{            
            console.log("VERTICAL")
            scene.activeCamera.fovMode = 0;
        }
        //camera.attachControl(canvas, true);

        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -1, 0), scene);
        light1.intensity = .1;
        light1.diffuse = greyColor;
        var light1_mirror = new BABYLON.HemisphericLight("light1_mirror", new BABYLON.Vector3(0, 1, 0), scene);
        light1_mirror.intensity = .1;
        light1_mirror.diffuse = greyColor;

        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 0, -10), scene);
        light2.intensity = 200;
        light2.range = 100;
        light2.diffuse = BABYLON.Color3.White();

        
        //var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

        return scene;
    };
    var scene = await createScene(); 

    loadMesh(scene);

    //createImagePlane(scene);
    let foreground = new GradientForeground(scene);

    engine.runRenderLoop(function() {
        scene.render();
    });
    window.addEventListener("resize", function () {                
        if(canvas.width < canvas.height){ 
            console.log("HORIZONTAL")
            scene.activeCamera.fovMode = BABYLON.FOVMODE_HORIZONTAL_FIXED;
        }else{            
            console.log("VERTICAL")
            scene.activeCamera.fovMode = 0;
        }
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
            material._albedoColor = new BABYLON.Color3(.5,.5,.5);
        }
        container.addAllToScene();
        runAnimation(meshes[0], scene);
    });
}
let speed = .12;
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
        this.contentContainer = document.getElementsByTagName("main")[0];
        document.body.onscroll = this.handleScroll;
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
    listener.handleScroll();
}

class GradientForeground {

    gradientPlane;

    constructor(scene){
        this.createForegroundPlane(scene);
    }
    createForegroundPlane =
    (scene) => {
        let plane = BABYLON.MeshBuilder.CreatePlane("plane",{size:10}, scene);
        plane.position = new BABYLON.Vector3(0, 0, 5);
        //plane.rotate(BABYLON.Axis.X, Math.PI/2, BABYLON.Space.WORLD);
        plane.visibility = .99;

        let dynTexture = new BABYLON.DynamicTexture("diffuseForeground", 512, scene, true);

        let planeMaterial = new BABYLON.StandardMaterial("planeMat", scene);
        planeMaterial.diffuseTexture = dynTexture;
        planeMaterial.emissiveColor = new BABYLON.Color3(1,1,1);
        planeMaterial.backFaceCulling = false;
        planeMaterial.alphaMode = BABYLON.Engine.ALPHA_MULTIPLY;

        plane.material = planeMaterial;


        let ctx = dynTexture.getContext();      

        let grd1 = ctx.createLinearGradient(0, 0, 1024, 1024); 

        let colorSteps = 1/4;

        grd1.addColorStop(0, "rgb(14,139,237)");

        grd1.addColorStop(.2, "rgb(0,224,139)");

        grd1.addColorStop(.38, "rgb(14,139,237)");

        grd1.addColorStop(.48, "rgb(0,224,139)");

        grd1.addColorStop(.8, "rgb(14,139,237)");

        grd1.addColorStop(1, "rgb(0,224,139)");

        ctx.fillStyle = grd1;

        ctx.fillRect(0, 0, 512, 512);

        dynTexture.update();

        let animation = new BABYLON.Animation("Animation", "material.diffuseTexture.vOffset", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
        let keys = []; 

        keys.push({
            frame: 0,
            value: 0,
        });

        keys.push({
            frame: 180,
            value: -.33,
        });

        animation.setKeys(keys);

        plane.animations.push(animation);

        //scene.beginAnimation(plane, 0, 210, true, 1);

        this.gradientPlane = plane;

        let rot = 0.0001;
        scene.registerBeforeRender(() => {
            //plane.rotate(BABYLON.Axis.Y, rot, BABYLON.Space.WORLD);
        })
    }
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