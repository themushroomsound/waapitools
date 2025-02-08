var waapiJS;
var activeViewName = "#home";
var currentModel,
    currentView;
var loadingScreen,
    connectionErrorMsg,
    connectionStatusMsg;

var selectedObjects = [];

var modules = {
    "#eventSoundbankFinder":    { name: "Event Soundbank Finder",   modelClass: EventSoundbankFinder,      viewClass: EventSoundbankFinderView,       toolTip: "Find out which soundbank(s) an event is included in" },
    "#batchAttEditor":          { name: "Batch Attenuation Editor", modelClass: WwiseAttenuationsFolder,   viewClass: BatchAttenuationsEditorView,    toolTip: "Edit multiple attenuations at once" },
    "#samplerKeymapper":        { name: "Sampler Keymapper",        modelClass: SamplerKeymapper,          viewClass: SamplerKeymapperView,           toolTip: "Map samples to keys" },
    "#notesReview":             { name: "Notes Review",             modelClass: NotesReview,               viewClass: NotesReviewView,                toolTip: "Review and manage notes" },
    "#renamer":                 { name: "Renamer",                  modelClass: Renamer,                   viewClass: RenamerView,                    toolTip: "Rename multiple objects" },
    "#creator":                 { name: "Creator",                  modelClass: Creator,                   viewClass: CreatorView,                    toolTip: "Batch create new objects" }
}

$().ready(function() {
    waapitools = new WaapitoolsModel();
    waapitoolsView = new WaapitoolsView($(document.documentElement), modules);
    waapitoolsView.setObject(waapitools);

    $(window).on("beforeunload", function() {
        waapitools.disconnect();
    });

    $(window).on("unload", function() {
        waapitools.disconnect();
    });
});

/*
// on page load
$().ready(function() {
    console.log("document ready");
    waapiJS = new WaapiJS(onWaapiJSConnected);

    // bind loading screen
    loadingScreen = $("#loading");

    // bind connection status message
    connectionStatusMsg = $("header h1 .name");
    connectionStatusMsg.text("attempting connection...");

    // bind connection error message
    connectionErrorMsg = $("#connectionError");
    connectionErrorMsg.show()

    if(locationType() != 0) {
        $("#connectionError #hosted #host").text(getHost());
        $("#connectionError #hosted").show()
    }    

    // bind buttons
    $(".btnNav").click( btnNav_onClick );
    $("body").on( "click", ".wwiseObjLink", wwiseObjLink_onClick );
});

// on navigation buttons click
function btnNav_onClick(e) {
    activeViewName = $(this).attr("href");
    switchToActiveView();
    //return false;
}

// on wwise link click
function wwiseObjLink_onClick(e) {
    waapiJS.findInProjectExplorer(e.target.href.slice(8));
    return false;
}

// on waapi connected
function onWaapiJSConnected() {
    waapiJS.getProjectName().then(function(projectName) {
        connectionStatusMsg.text(projectName);
    });
    connectionErrorMsg.hide();
    waapiJS.subscribeSelectionChanged(onSelectionChanged);
    onSelectionChanged();
    switchToActiveView();
}

// on wwise selection changed
function onSelectionChanged(args, kwargs, details) {
    applySelectedObjectToActiveView();
}


// loads up wwise's currently selected object in the current tool if possible
function applySelectedObjectToActiveView()
{
    if(activeViewName == "#home" || activeViewName == "#about")
        return;

    waapiJS.querySelectedObjects().then(function(res) {

        console.log("Selected objects", res);
        if( res.length < 1)
            return;

        currentModel = new modules[activeViewName]["modelClass"] (res[0], waapiJS, true);
        loadingScreen.show();
        currentModel.fetchData().then(
            function() {
                currentView = new modules[activeViewName]["viewClass"]($(activeViewName));
                currentView.setObject(currentModel);
                loadingScreen.hide();
            },
            function() {
                console.log("selected wwise object not appropriate for this tool");
                currentView = new modules[activeViewName]["viewClass"]($(activeViewName));
                currentView.reset();
                loadingScreen.hide();
            }
        );
    });
}*/