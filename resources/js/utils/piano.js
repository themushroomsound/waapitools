class Piano {

    constructor(htmlContainer)
    {
        this.htmlContainer = htmlContainer;
        console.log("New Piano");

        this.keys = [];
        this.build();
    }

    build()
    {
        for(let i=0; i<128; i++) {
            var pitch = Pitchiz.createPitchFromMIDINote(i);
            var color = [1,3,6,8,10].includes(pitch.chroma) ? "black" : "white";
            var newKey = $("<div>");
            newKey.addClass("key");
            newKey.addClass(pitch.chromaName);
            newKey.addClass(color);
            $(this.htmlContainer).append(newKey);
            this.keys.push(newKey);
        }
    }

    getKey(index)
    {
        return this.keys[index];
    }
}
