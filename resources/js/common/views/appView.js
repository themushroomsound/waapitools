class AppView extends GenericView
{
    constructor(htmlElement, modules)
    {
        super(htmlElement);

        // store available modules/tools
        this.modules = modules;
        this.activeViewName = "#home";

        // bind DOM elements
        this.loadingScreen = $("#loading");
        this.connectionStatusMsg = $("header h1 .name");
        this.connectionErrorMsg = $("#connectionError");
        this.wwiseLockedErrorMsg = $("#wwiseLockedError");        

        // adapt connection error message to location type
        if(this.locationType() != 0) {
            $("#connectionError #hosted #host").text(this.getHost());
            $("#connectionError #hosted").show()
        }

        // bind buttons
        let self = this;

        $(".btnNav").click(function(e) {
            self.onBtnNavClicked(e);
            return false;
        });

        $("body").on( "click", ".wwiseObjLink", function(e) {
            self.onWwiseObjLinkClicked(e);
            return false;
        });

        this.switchToView(document.location.hash || "#home");
    }

    refresh()
    {
        // stop here if waapitools is not initialized
        if(!this.object)
            return;

        if(!this.object.session && (this.object.connectionClosedReason == "lost" || this.object.connectionClosedReason == "unreachable")) {
            this.connectionStatusMsg.text("no connection to wwise project");
            this.connectionErrorMsg.show();
            return;
        }

        if(this.object.wwiseLocked) { 
            this.connectionStatusMsg.text("no connection to wwise project");
            this.wwiseLockedErrorMsg.show();
            return;
        }        

        this.connectionStatusMsg.text(this.object.projectName);
        this.connectionErrorMsg.hide();
        this.wwiseLockedErrorMsg.hide();

        // stop here if the current page is not a tool (home, about...)
        if(!(this.activeViewName in this.modules))
            return;

        // stop here if selected object is not known yet
        if(!this.object.selectedObjects)
            return;

        // initialize the current tool with the current selected object
        this.currentModel = new this.modules[this.activeViewName]["modelClass"] (this.object.selectedObjects, this.object, true);
        this.currentView = new this.modules[this.activeViewName]["viewClass"]($(this.activeViewName));

        // TODO: Should this be in the model?
        let self = this;
        this.loadingScreen.show();
        this.currentModel.viewObject.fetchData().then(
            function() {
                self.currentView.setObject(self.currentModel.viewObject);
                self.loadingScreen.hide();
            },
            function() {
                console.log("selected wwise object not appropriate for this tool");
                self.currentView.reset();
                self.loadingScreen.hide();
            }
        );
    }

    locationType(){
        if( window.location.protocol == 'file:' ){ return 0; }
        if( !window.location.host.replace( /localhost|127\.0\.0\.1/i, '' ) ){ return 2; }
        return 1;
    }
    
    getHost() {
        return window.location.protocol + "//" + window.location.host;
    }    

    onBtnNavClicked(e) {
        this.switchToView(e.target.hash);
    }

    onWwiseObjLinkClicked(e) {
        this.object.findInProjectExplorer(e.target.href.slice(8));
    }

    switchToView(activeViewName) {
        this.activeViewName = activeViewName
        this.refresh();
        $('.btnNav').removeClass("active");
        $('.btnNav[href="' + activeViewName + '"]').addClass("active");
        $("section").hide();
        $(".view").hide();
        $(this.activeViewName).show();
    }
}