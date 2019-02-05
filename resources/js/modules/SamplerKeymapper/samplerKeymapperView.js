class SamplerKeymapperView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        var samplerKeymapperView = this;

        // blend container children list
        this.childrenTable = $(this.htmlElement).find(".blendContainerChildren");
        // piano GUI
        this.pianoKeyboardElement = $(this.htmlElement).find(".pianoKeyboard");
        this.pianoKeyboard = new Piano(this.pianoKeyboardElement);
        // mapping errors
        this.mappingErrorsView = new GenericView($(this.htmlElement).find("#mappingErrorsView"));
        // commit button
        this.commitButton = new GenericButton($(this.htmlElement).find("#btn_commit"));

        this.commitButton.setClick(function(e) {
            samplerKeymapperView.onBtnCommitClicked(e);
            return false;
        });

        this.refresh();
    }

    refresh()
    {
        super.refresh();

        // hide/reset stuff
        this.mappingErrorsView.hide();
        this.commitButton.hide();
        this.pianoKeyboardElement.hide();
        this.pianoKeyboardElement.find(".sample").remove();
        this.childrenTable.html("<tr><td>none</td></tr>");

        if( !this.wwiseObject)
            return;

        var children = this.wwiseObject.childrenObjects;
        if( children.length > 0 )
        {
            this.childrenTable.html("");
            for(let index in children) {
                var pitch = children[index].pitch;

                var newRow = $("#template_blendContainerChildRow").contents().clone();
                newRow.find(".blendContainerName").append( children[index].getObjLink(true) );

                if( pitch == null ) {
                    newRow.find(".noteDetection").text( "- could not detect note from name" );
                    newRow.find(".detectedNoteIndex").hide();
                }
                else {
                    newRow.find(".noteDetection").text( "- detected note " );
                    newRow.find(".detectedNoteName").append( pitch.formattedNoteName );
                    newRow.find(".detectedNoteIndex span").append( pitch.midiNote );
                }

                newRow.appendTo(this.childrenTable);
            }
        }

        // if all good display mapping
        if( this.checkForErrors() )
        {
            this.pianoKeyboardElement.show();

            let parentTop = this.pianoKeyboardElement.position().top;
            let parentLeft = this.pianoKeyboardElement.position().left + parseInt(this.pianoKeyboardElement.css('marginLeft'));
            let samplerKeymapperView = this;

            for(let index in children) {
                let sample = children[index];
                let sampleElement = $("#template_pianoSample").contents().clone();
                sampleElement.find(".range span").text(" " + children[index].name);
                let minRangeKey = this.pianoKeyboard.getKey(sample.MidiKeyFilterMin);
                let maxRangeKey = this.pianoKeyboard.getKey(sample.MidiKeyFilterMax);
                let leftPos = minRangeKey.position().left + parseInt(minRangeKey.css('marginLeft'));
                let rightPos = maxRangeKey.position().left + parseInt(maxRangeKey.css('marginLeft')) + maxRangeKey.width();
                let width = rightPos - leftPos;
                this.pianoKeyboardElement.append(sampleElement);

                sampleElement.attr("data:rootKey", sample.MidiTrackingRootNote);
                sampleElement.attr("data:minKey", sample.MidiKeyFilterMin);
                sampleElement.attr("data:maxKey", sample.MidiKeyFilterMax);

                sampleElement.find(".range").css("left", leftPos - parentLeft);
                sampleElement.find(".range").css("width", width);

                sampleElement.hover(function(e) {
                    samplerKeymapperView.onSampleMouseOver(this);
                },
                function(e) {
                    samplerKeymapperView.onSampleMouseOut(this);
                });
            }

            this.commitButton.show();
        }

        this.commitButton.enable();
    }

    onSampleMouseOver(sampleElement)
    {
        let min = parseInt($(sampleElement).attr("data:minKey"));
        let max = parseInt($(sampleElement).attr("data:maxKey"));
        let root = parseInt($(sampleElement).attr("data:rootKey"));
        for(var i=min; i<=max; i++) {
            if( i == root )
                this.pianoKeyboard.getKey(i).addClass("root");
            else
                this.pianoKeyboard.getKey(i).addClass("inRange");
        }
    }

    onSampleMouseOut(sampleElement)
    {
        let min = $(sampleElement).attr("data:minKey");
        let max = $(sampleElement).attr("data:maxKey");
        for(var i=parseInt(min); i<=parseInt(max); i++) {
            this.pianoKeyboard.getKey(i).removeClass("root");
            this.pianoKeyboard.getKey(i).removeClass("inRange");
        }
    }

    checkForErrors()
    {
        let mappingErrors = this.wwiseObject.getMappingErrors();

        // no errors
        if( mappingErrors.length == 0 )
            return true;

        // errors
        $(this.htmlElement).find("#mappingErrorsList").empty();
        for( let i=0; i < mappingErrors.length; i++ )
        {
            let curError = mappingErrors[i];
            let newElement = $("#template_mappingError_" + curError.name).contents().clone();
            for( let property in curError )
                newElement.find("."+property).text( curError[ property ] );
            $(this.htmlElement).find("#mappingErrorsList").append(newElement);
        }

        this.mappingErrorsView.show();

        return false;
    }

    onBtnCommitClicked(e)
    {
        this.wwiseObject.commit();
        this.commitButton.disable();
    }
}
