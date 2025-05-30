class SamplerKeymapper extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        this.wwiseObject = new SamplerKeymapperWwiseObject(selectedObjects[0], waapiJS, debug);
    }

    get viewObject()
    {
        return this.wwiseObject;
    }
}

class SamplerKeymapperWwiseObject extends WwiseBlendContainer
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
        console.log("Building Sampler Keymapper from Wwise Blend Container " + this.guid + " - " + this.name);
    }

    isValid()
    {
        if( this.category == "Actor-Mixer Hierarchy" && ( this.type == "BlendContainer" ))
            return true;
        return false;
    }

    fetchData()
    {
        var samplerKeymapper = this;
        return super.fetchData().then(function() {
            return samplerKeymapper.fetchChildren();
        })
    }

    fetchChildren()
    {
        var samplerKeymapper = this;
        return super.fetchChildren().then(function() {
            samplerKeymapper.attemptMapping();
        })
    }

    // override makeChildObject to create SamplerKeymapperChildren
    makeChildObject(wwiseObject)
    {
        return new SamplerKeymapperChild(wwiseObject, this.waapiJS);
    }

    // checks whether mapping is possible
    getMappingErrors()
    {
        let errors = [];

        // checks whether container is empty
        if( this.childrenObjects.length < 1) {
            return [ { name: "EmptySamplerError" } ];
        }

        // check each child
        for( let i=0; i < this.childrenObjects.length; i++ )
        {
            let curSample = this.childrenObjects[i];

            // check if a note is found in name
            if( curSample.note == null)
            {
                let newError = {
                    name: "NoNoteDetectedError",
                    sampleName: curSample.name
                }
                errors.push(newError);
            }
        }

        console.log(errors);
        return errors;
    }

    attemptMapping()
    {
        let mappingErrors = this.getMappingErrors();
        if( mappingErrors.length != 0 )
            return;

        console.log("mapping!");
        this.sortSamplesByRootNote();

        for( let i=0; i<this.childrenObjects.length; i++ )
        {
            var curChild = this.childrenObjects[i];

            // find min midi key
            if( i == 0 ) // if 1st index
                curChild.MidiKeyFilterMin = 0;
            else {
                var prevChild = this.childrenObjects[i-1];
                var preInterval = curChild.MidiTrackingRootNote - prevChild.MidiTrackingRootNote;
                curChild.MidiKeyFilterMin = Math.ceil(curChild.MidiTrackingRootNote - preInterval/2);
                if( curChild.MidiKeyFilterMin == prevChild.MidiKeyFilterMax )
                    curChild.MidiKeyFilterMin++;
            }

            // find max midi key
            if( i == this.childrenObjects.length - 1) // if last index
                curChild.MidiKeyFilterMax = 127;
            else {
                var nextChild = this.childrenObjects[i+1];
                var postInterval = nextChild.MidiTrackingRootNote - curChild.MidiTrackingRootNote;
                curChild.MidiKeyFilterMax = Math.floor(curChild.MidiTrackingRootNote + postInterval/2);
            }
        }

        console.log(this.childrenObjects);
    }

    sortSamplesByRootNote()
    {
        console.log("sorting");
        this.childrenObjects.sort(function(a,b) {
            return a["midiKey"]["index"] - b["midiKey"]["index"];
        });
    }

    commit()
    {
        console.log("committing sampler keymapping to wwise");
        let samplerKeymapper = this;

        // commit child attenuations
        for(let i=0; i < this.childrenObjects.length; i++)
            this.childrenToCommit.push(this.childrenObjects[i]);
        this.commitNextChildObject();
    }

    commitNextChildObject()
    {
        if( this.childrenToCommit.length < 1) {
            console.log("All children committed for " + this.name);
            this.refreshViews();
            return;
        }
        let nextChildToCommit = this.childrenToCommit.shift();
        let samplerKeymapper = this;
        return nextChildToCommit.commit().then(function() {
            return samplerKeymapper.commitNextChildObject();
        });
    }
}

class SamplerKeymapperChild extends WwiseActorMixerObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
        console.log("Building Sampler Keymapper Child from Wwise Actor-Mixer Object " + this.guid + " - " + this.name);

        var wwiseKeyboardDef = new pitchiz.MIDIKeyboard(-1);
        this.note = pitchiz.Note.findNoteInString(this.name);
        this.midiKey = this.note != null ? this.note.getKey(wwiseKeyboardDef) : null;

        this.OverrideMidiNoteTracking = true;
        this.EnableMidiNoteTracking = true;
        this.MidiTrackingRootNote = this.midiKey != null ? this.midiKey.index : 48; // 48 = C3
        this.MidiKeyFilterMin = 0;
        this.MidiKeyFilterMax = 127;
    }

    commit()
    {
        let samplerKeymapperChild = this;
        return super.commit().then(function() {
            console.log("sample " + samplerKeymapperChild.name + " committed");
        }).then(function() {
            return samplerKeymapperChild.commitProperty("OverrideMidiNoteTracking");
        }).then(function() {
            return samplerKeymapperChild.commitProperty("EnableMidiNoteTracking");
        }).then(function() {
            return samplerKeymapperChild.commitProperty("MidiTrackingRootNote");
        }).then(function() {
            return samplerKeymapperChild.commitProperty("MidiKeyFilterMin");
        }).then(function() {
            return samplerKeymapperChild.commitProperty("MidiKeyFilterMax");
        }).then(function() {
            console.log("Key mapping committed for sample " + samplerKeymapperChild.name);
        });
    }
}
