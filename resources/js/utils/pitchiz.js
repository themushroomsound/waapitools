Pitchiz = {}

Pitchiz.chromaNames = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
Pitchiz.noteNameRegex = /([A-G][#b♯♭]{0,1})(-{0,1}[0-9])/;
Pitchiz.minOctave = -1;

// attempts to detect a note name in a string and creates a pitch object
Pitchiz.extractPitchFromString = function(string) {
    var match = string.match(Pitchiz.noteNameRegex);
    if( match != null )
        return new Pitchiz.Pitch(match[0]);
    return null;
}

// create a pitch object from a MIDI note number (0 -> 127)
Pitchiz.createPitchFromMIDINote = function(midiNote) {
    var chroma = midiNote % 12;
    var octave = Math.floor(midiNote/12);
    var chromaName = Pitchiz.chromaNames[chroma];
    var octaveName = Pitchiz.minOctave + octave;
    return new Pitchiz.Pitch(chromaName + octaveName);
}

// Pitch class
Pitchiz.Pitch = class Pitch
{
    constructor(noteName)
    {
        var match = noteName.match(Pitchiz.noteNameRegex);
        if( match == null )
            throw "Pitch constructor parameter was not recognized as a note name, cannot create Pitch object";

        this.originalNoteName = noteName;
        this.formattedNoteName = this.formatNoteName(noteName);

        var splitNoteName = this.formattedNoteName.split(Pitchiz.noteNameRegex).filter(Boolean);

        this.chromaName = splitNoteName[0];
        this.octaveName = splitNoteName[1];

        this.chroma = this.getChroma(this.chromaName);
        this.octave = this.getOctave(this.octaveName);

        this.midiNote = this.getMidiNote(this.chroma, this.octave);
    }

    formatNoteName(noteName)
    {
        noteName = noteName.replace("#", "♯").replace("b", "♭");
        noteName = noteName.replace("D♯", "E♭").replace("A♯", "B♭");
        return noteName;
    }

    getChroma(chromaName)
    {
        for( let i=0; i<Pitchiz.chromaNames.length; i++ ) {
            if( chromaName == Pitchiz.chromaNames[i] )
                return i;
        }
        return null;
    }

    getOctave(octaveName)
    {
        return parseInt(octaveName) - Pitchiz.minOctave;
    }

    getMidiNote(chroma, octave)
    {
        return octave * 12 + chroma;
    }
}
