var waapiJS;
var activeViewName = "#home";
var currentModel,
    currentView;
var loadingScreen,
    connectionErrorMsg,
    connectionStatusMsg;

var selectedObjects = [];

var modules = {
    "#creator":                 { name: "Creator",                 modelClass: Creator,                   viewClass: CreatorView,                   toolTip: "batch creates objects from a list" },
    "#renamer":                 { name: "Renamer",                 modelClass: Renamer,                   viewClass: RenamerView,                   toolTip: "batch search/replace in an object's name, its children's names, and events referencing it or its children" },
    "#notesReview":             { name: "Notes Review",            modelClass: NotesReview,               viewClass: NotesReviewView,               toolTip: "a comprehensive review of all notes in the Wwise project" },
    "#eventSoundbankFinder":    { name: "Event Soundbank Finder",  modelClass: EventSoundbankFinder,      viewClass: EventSoundbankFinderView,      toolTip: "find out which soundbank(s) an event is included in, even indirectly through a parent folder or WWU" },
    "#samplerKeymapper":        { name: "Sampler Keymapper",       modelClass: SamplerKeymapper,          viewClass: SamplerKeymapperView,          toolTip: "automatically map children of a blend container across the MIDI keyboard based on their names" },
    "#batchAttEditor":          { name: "Batch Attenuation Editor",modelClass: WwiseAttenuationsFolder,   viewClass: BatchAttenuationsEditorView,   toolTip: "create or edit a batch of related attenuations over different maximum distances" }
}

$().ready(function() {
    waapitools = new AppModel();
    waapitoolsView = new AppView($(document.documentElement), modules);
    waapitoolsView.setObject(waapitools);

    $(window).on("beforeunload", function() {
        waapitools.disconnect();
    });

    $(window).on("unload", function() {
        waapitools.disconnect();
    });
});