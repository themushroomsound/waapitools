var waapiJS;
var activeView = "#batchAttEditor";
var eventSoundbankFinderView, batchAttenuationsEditorView, attenuationView;
var selectedObjects = [];

$().ready(function() {
    console.log("document ready");
    waapiJS = new WaapiJS(onWaapiJSConnected);
    eventSoundbankFinderView = new EventSoundbankFinderView($("#eventSoundbankFinder"));
    batchAttenuationsEditorView = new BatchAttenuationsEditorView($("#batchAttEditor"));
    $(".btnNav").click( btnNav_onClick );
    $("body").on( "click", ".wwiseObjLink", wwiseObjLink_onClick );
    displayActiveView();
});

function btnNav_onClick(e) {
    activeView = $(this).attr("href");
    displayActiveView();
    return false;
}

function wwiseObjLink_onClick(e) {
    console.log("click click");
    waapiJS.findInProjectExplorer(e.target.href.slice(8));
    return false;
}

function displayActiveView() {
    $('.btnNav').removeClass("active");
    $('.btnNav[href="' + activeView + '"]').addClass("active");
    $("section").hide();
    $(activeView).show(300);
}

function onWaapiJSConnected() {
    waapiJS.getProjectName().then(function(projectName) {
        $("header h1 .name").text(projectName);
    });
    waapiJS.subscribeSelectionChanged(onSelectionChanged);
    onSelectionChanged();
}

function onSelectionChanged(args, kwargs, details) {
    waapiJS.querySelectedObjects().then(function(res) {
        console.log("Selected objects", res);
        if( res.length < 1)
            return;

        if( res[0].type == "Event" )
        {
            var event = new WwiseEvent(res[0], waapiJS);
            event.fetchWwiseData().then(function() {
                console.log("Done initializing " + event.path);
                eventSoundbankFinderView.setWwiseObject(event);
            });
        }

        else if( res[0].category == "Attenuations" && ( res[0].type == "Folder" || res[0].type == "WorkUnit" ))
        {
            var folder = new WwiseAttenuationsFolder(res[0], waapiJS);
            folder.fetchWwiseData().then(function() {
                console.log("Done initializing " + folder.path);
                batchAttenuationsEditorView.setWwiseObject(folder);
            });
        }
    });
}
