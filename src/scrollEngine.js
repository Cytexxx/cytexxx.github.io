window.onload = function(){
    bindScrollEvent();
}
class scrollListener{
    elementCollection;
    elementsOnScreen = [];
    threshold = 100;
    activeClass = "activeOnScreen";

    contentContainer;

    activateQueue = [];

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