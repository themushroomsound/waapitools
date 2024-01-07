var waapiJS;
var activeViewName = "#home";
var currentModel,
    currentView;
var loadingScreen;

var selectedObjects = [];

var modules = {
    "#eventSoundbankFinder":    { modelClass: EventSoundbankFinder,      viewClass: EventSoundbankFinderView },
    "#batchAttEditor":          { modelClass: WwiseAttenuationsFolder,   viewClass: BatchAttenuationsEditorView },
    "#samplerKeymapper":        { modelClass: SamplerKeymapper,          viewClass: SamplerKeymapperView },
    "#notesReview":             { modelClass: NotesReview,               viewClass: NotesReviewView },
    "#renamer":                 { modelClass: Renamer,                   viewClass: RenamerView },
    "#creator":                 { modelClass: Creator,                   viewClass: CreatorView }
}

// on page load
$().ready(function() {
    console.log("document ready");
    waapiJS = new WaapiJS(onWaapiJSConnected);

    // bind loading screen
    loadingScreen = $("#loading");

    // bind buttons
    $(".btnNav").click( btnNav_onClick );
    $("body").on( "click", ".wwiseObjLink", wwiseObjLink_onClick );
});

// on navigation buttons click
function btnNav_onClick(e) {
    activeViewName = $(this).attr("href");
    switchToActiveView();
    return false;
}

// on wwise link click
function wwiseObjLink_onClick(e) {
    waapiJS.findInProjectExplorer(e.target.href.slice(8));
    return false;
}

// on waapi connected
function onWaapiJSConnected() {
    waapiJS.getProjectName().then(function(projectName) {
        $("header h1 .name").text(projectName);
    });
    waapiJS.subscribeSelectionChanged(onSelectionChanged);
    onSelectionChanged();
    switchToActiveView();
}

// on wwise selection changed
function onSelectionChanged(args, kwargs, details) {
    applySelectedObjectToActiveView();
}

// displays the active view and hides the others
function switchToActiveView() {
    $('.btnNav').removeClass("active");
    $('.btnNav[href="' + activeViewName + '"]').addClass("active");
    $("section").hide();
    applySelectedObjectToActiveView();
    $(activeViewName).show(300);
}

// loads up wwise's currently selected object in the current tool if possible
function applySelectedObjectToActiveView()
{
    waapiJS.querySelectedObjects().then(function(res) {

        if(activeViewName == "#home")
            return;

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
}
