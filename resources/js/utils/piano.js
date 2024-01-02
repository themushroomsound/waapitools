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
        $(this.htmlContainer).empty();
        var wwiseKeyboardDefinition = new pitchiz.MIDIKeyboard(-1);
        var piano = this;
        for(let i=0; i<128; i++) {
            //var pitch = Pitchiz.createPitchFromMIDINote(i);
            var note = wwiseKeyboardDefinition.getKey(i).getNote();
            var color = [1,3,6,8,10].includes(note.chroma.index) ? "black" : "white";
            var newKey = $("<div>");
            newKey.addClass("key");
            newKey.addClass(note.chroma.toString());
            newKey.addClass(color);
            newKey.attr("data:noteName", note.toString());
            $(this.htmlContainer).append(newKey);
            this.keys.push(newKey);

            newKey.hover(function(e) {
                piano.onKeyMouseOver(this);
            },
            function(e) {
                piano.onKeyMouseOut(this);
            });
        }

        this.tooltip = $("<div>");
        this.tooltip.addClass("tooltip");
        $(this.htmlContainer).append(this.tooltip);
    }

    onKeyMouseOver(key)
    {
        let position = $(key).position();
        this.tooltip.text($(key).attr("data:noteName"));
        this.tooltip.css(position);
        this.tooltip.show();
    }

    onKeyMouseOut(key)
    {
        this.tooltip.hide();
    }

    getKey(index)
    {
        return this.keys[index];
    }
}
