var waapiJS;
var activeView = "#samplerKeymapper";
var eventSoundbankFinderView, batchAttenuationsEditorView, attenuationView;
var selectedObjects = [];

// on page load
$().ready(function() {
    console.log("document ready");
    waapiJS = new WaapiJS(onWaapiJSConnected);

    // create views
    eventSoundbankFinderView = new EventSoundbankFinderView($("#eventSoundbankFinder"));
    batchAttenuationsEditorView = new BatchAttenuationsEditorView($("#batchAttEditor"));
    samplerKeymapperView = new SamplerKeymapperView($("#samplerKeymapper"));

    // bind buttons
    $(".btnNav").click( btnNav_onClick );
    $("body").on( "click", ".wwiseObjLink", wwiseObjLink_onClick );

    displayActiveView();
});

// on navigation buttons click
function btnNav_onClick(e) {
    activeView = $(this).attr("href");
    displayActiveView();
    return false;
}

// on wwise link click
function wwiseObjLink_onClick(e) {
    waapiJS.findInProjectExplorer(e.target.href.slice(8));
    return false;
}

// displays the active view and hides the others
function displayActiveView() {
    $('.btnNav').removeClass("active");
    $('.btnNav[href="' + activeView + '"]').addClass("active");
    $("section").hide();
    $(activeView).show(300);
}

// on waapi connected
function onWaapiJSConnected() {
    waapiJS.getProjectName().then(function(projectName) {
        $("header h1 .name").text(projectName);
    });
    waapiJS.subscribeSelectionChanged(onSelectionChanged);
    onSelectionChanged();
}

// on wwise selection changed
function onSelectionChanged(args, kwargs, details) {
    waapiJS.querySelectedObjects().then(function(res) {

        console.log("Selected objects", res);
        if( res.length < 1)
            return;

        // Active view is Event Soundbanks Finder
        if( activeView == "#eventSoundbankFinder" )
        {
            if( res[0].type == "Event" )
            {
                var event = new WwiseEvent(res[0], waapiJS);
                event.fetchWwiseData().then(function() {
                    console.log("Done initializing " + event.path);
                    eventSoundbankFinderView.setWwiseObject(event);
                });
            }
        }

        // Active view is Batch Attenuations Editor
        else if( activeView == "#batchAttEditor" )
        {
            if( res[0].category == "Attenuations" && ( res[0].type == "Folder" || res[0].type == "WorkUnit" ))
            {
                var folder = new WwiseAttenuationsFolder(res[0], waapiJS);
                folder.fetchWwiseData().then(function() {
                    console.log("Done initializing " + folder.path);
                    batchAttenuationsEditorView.setWwiseObject(folder);
                });
            }
        }

        // Active view is Sampler Keymapper
        else if( activeView == "#samplerKeymapper" )
        {
            if( res[0].category == "Actor-Mixer Hierarchy" && ( res[0].type == "BlendContainer" ))
            {
                var samplerKeyMapper = new SamplerKeymapper(res[0], waapiJS);
                samplerKeyMapper.fetchWwiseData().then(function() {
                    console.log("Done initializing " + samplerKeyMapper.path);
                    samplerKeymapperView.setWwiseObject(samplerKeyMapper);
                });
            }
        }
    });
}
