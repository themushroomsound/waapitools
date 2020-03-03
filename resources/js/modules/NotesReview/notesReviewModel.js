var objectTypes = [
    'AcousticTexture',
    'Action',
    'ActionException',
    'ActorMixer',
    'Attenuation',
    'AudioDevice',
    'AudioSource',
    'AuxBus',
    'BlendContainer',
    'BlendTrack',
    'Bus',
    'ControlSurfaceBinding',
    'ControlSurfaceBindingGroup',
    'ControlSurfaceSession',
    'Conversion',
    'Curve',
    'CustomState',
    'DialogueEvent',
    'Effect',
    'Event',
    'ExternalSource',
    'ExternalSourceFile',
    'Folder',
    'GameParameter',
    'Language',
    'MidiParameter',
    'MixingSession',
    'Modifier',
    'ModulatorEnvelope',
    'ModulatorLfo',
    'ModulatorTime',
    'MultiSwitchEntry',
    'MusicClip',
    'MusicClipMidi',
    'MusicCue',
    'MusicEventCue',
    'MusicFade',
    'MusicPlaylistContainer',
    'MusicPlaylistItem',
    'MusicSegment',
    'MusicStinger',
    'MusicSwitchContainer',
    'MusicTrack',
    'MusicTrackSequence',
    'MusicTransition',
    'ObjectSettingAssoc',
    'Panner',
    'ParamControl',
    'Path',
    'Platform',
    'PluginDataSource',
    'Position',
    'Project',
    'Query',
    'RandomSequenceContainer',
    'SearchCriteria',
    'Sound',
    'SoundBank',
    'SoundcasterSession',
    'State',
    'StateGroup',
    'Switch',
    'SwitchContainer',
    'SwitchGroup',
    'Trigger',
    'UserProjectSettings',
    'WorkUnit'
];

var paths = [
    "\\Actor-Mixer Hierarchy",
    "\\Attenuations",
    "\\Audio Devices",
    "\\Control Surface Sessions",
    "\\Conversion Settings",
    "\\Dynamic Dialogue",
    "\\Effects",
    "\\Events",
    "\\Game Parameters",
    "\\Interactive Music Hierarchy",
    "\\Master-Mixer Hierarchy",
    "\\Mixing Sessions",
    "\\Modulators",
    "\\Presets",
    "\\Queries",
    "\\SoundBanks",
    "\\Soundcaster Sessions",
    "\\States",
    "\\Switches",
    "\\Triggers",
    "\\Virtual Acoustics"
];


class NotesReview
{
    constructor(waapiJS)
    {
        this.waapiJS = waapiJS;
        this.objectsWithNotes = [];

        console.log("Building Notes Review");

        var query = {
            from:{path:paths},
            transform:[
                {select:['descendants']}
            ]
        };

        var notesReview = this;
        this.waapiJS.queryObjects(query).then(function(res) {
            var allObjects = res.kwargs.return;
            for(var i=0; i<allObjects.length; i++) {
                if(allObjects[i].notes != "") {
                    var newObject = new WwiseObject(allObjects[i]);
                    notesReview.objectsWithNotes.push(newObject);
                }
            }
            return res;
        });
    }
}
